import { Injectable, signal } from "@angular/core";
import { readOverrides } from "./mfe-overrides";

/** One entry in the runtime manifest. */
export interface MfeManifestEntry {
  /** Custom-element name the bundle registers. */
  tag: string;
  /** ES-module bundle URL (absolute, or relative to the host's base href). */
  url: string;
  /** Subresource Integrity hash, e.g. `sha384-…`. The browser refuses a mismatching bundle. */
  integrity?: string;
  /**
   * Budget for the whole load, retries included, until the element is defined.
   * Default 10 000 ms.
   */
  timeoutMs?: number;
}

export type MfeState = "loading" | "ready" | "failed";

export interface MfeStatus {
  state: MfeState;
  url?: string;
  error?: string;
  overridden?: boolean;
}

const DEFAULT_TIMEOUT_MS = 10_000;
/** Backoff before each retry (so also the number of retries), ±25 % jitter. */
const RETRY_BACKOFF_MS = [250, 1_000];
/** Query parameter that gives each retry its own module-map entry. */
const RETRY_PARAM = "mfe-retry";

type AttemptOutcome =
  | { kind: "defined" }
  | { kind: "load-error" }
  | { kind: "threw"; message: string }
  | { kind: "timeout" };

interface Diagnosis {
  transient: boolean;
  reason: string;
}

/**
 * Discovers MFEs from the manifest and loads each self-contained bundle with a
 * `<script type="module">`. No federation, no shared runtime.
 *
 * Resilience: every MFE loads independently within its own time budget; a
 * failure marks only that MFE as `failed` (the host renders fallback UI in its
 * slot) and never blocks the others. Each tag is loaded at most once.
 *
 * Retry policy: only a transient fetch failure (network error, HTTP 5xx, 408,
 * 429) is retried, with jittered exponential backoff (`RETRY_BACKOFF_MS`),
 * inside the same budget. Deterministic failures fail fast: an SRI mismatch,
 * any other HTTP error, a bundle that throws while evaluating, and one that
 * never registers its element.
 */
@Injectable({ providedIn: "root" })
export class MfeLoaderService {
  private readonly loading = new Map<string, Promise<void>>();
  private readonly statuses = signal<Record<string, MfeStatus>>({});
  private readonly manifestKnown = signal(false);

  /** Status per tag. Tags missing from a loaded manifest are `failed`. */
  status(tag: string): MfeStatus {
    const status = this.statuses()[tag];
    if (status) return status;
    return this.manifestKnown()
      ? { state: "failed", error: "not listed in the manifest" }
      : { state: "loading" };
  }

  state(tag: string): MfeState {
    return this.status(tag).state;
  }

  /** Fetches the manifest, applies local-dev overrides and starts loading every entry. */
  async loadManifest(url: string): Promise<void> {
    let manifest: MfeManifestEntry[];
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      manifest = await res.json();
    } catch (err) {
      console.error(`[mfe-loader] manifest ${url} unavailable`, err);
      this.manifestKnown.set(true);
      return;
    }
    const overrides = readOverrides();
    for (const entry of manifest) {
      const override = overrides[entry.tag];
      const effective = override
        ? { tag: entry.tag, url: override, timeoutMs: entry.timeoutMs }
        : entry;
      this.load(effective, !!override).catch(() => {
        /* status already records the failure */
      });
    }
    this.manifestKnown.set(true);
  }

  load(entry: MfeManifestEntry, overridden = false): Promise<void> {
    let pending = this.loading.get(entry.tag);
    if (!pending) {
      this.setStatus(entry.tag, {
        state: "loading",
        url: entry.url,
        overridden,
      });
      pending = this.inject(entry).then(
        () =>
          this.setStatus(entry.tag, {
            state: "ready",
            url: entry.url,
            overridden,
          }),
        (err: Error) => {
          console.error(`[mfe-loader] ${err.message}`);
          this.setStatus(entry.tag, {
            state: "failed",
            url: entry.url,
            error: err.message,
            overridden,
          });
          throw err;
        },
      );
      this.loading.set(entry.tag, pending);
    }
    return pending;
  }

  private setStatus(tag: string, status: MfeStatus): void {
    this.statuses.update((all) => ({ ...all, [tag]: status }));
  }

  private async inject(entry: MfeManifestEntry): Promise<void> {
    const fail = (reason: string) => new Error(`MFE "${entry.tag}" ${reason}`);
    if (customElements.get(entry.tag)) {
      throw fail("is already defined by another bundle");
    }
    const url = new URL(entry.url, document.baseURI).href;
    const timeoutMs = entry.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const started = performance.now();
    const budget = new AbortController();
    const timer = setTimeout(() => budget.abort(), timeoutMs);
    const timedOut = () => fail(`was not defined within ${timeoutMs} ms`);
    // The element is registered inside the MFE's async bootstrap, so wait for
    // whenDefined rather than the script's load event.
    const defined = customElements.whenDefined(entry.tag);

    try {
      for (let attempt = 1; ; attempt++) {
        // A failed module URL stays failed in the document's module map, so
        // every retry uses a fresh URL; SRI applies to it all the same.
        const src =
          attempt === 1 ? url : withParam(url, RETRY_PARAM, attempt - 1);
        const outcome = await runScript(
          src,
          entry.integrity,
          defined,
          budget.signal,
        );
        if (outcome.kind === "defined") {
          if (attempt > 1) {
            console.info(
              `[mfe-loader] "${entry.tag}" loaded on attempt ${attempt}`,
            );
          }
          return;
        }
        if (outcome.kind === "timeout") throw timedOut();
        if (outcome.kind === "threw") {
          throw fail(`threw while loading: ${outcome.message}`);
        }

        // The script's error event doesn't say why; ask the server.
        const diagnosis = await diagnose(src, entry.integrity, budget.signal);
        if (budget.signal.aborted) throw timedOut();
        const attempts = attempt > 1 ? `, ${attempt} attempts` : "";
        const failed = `failed to load ${entry.url} (${diagnosis.reason}${attempts})`;
        if (!diagnosis.transient || attempt > RETRY_BACKOFF_MS.length) {
          throw fail(failed);
        }
        const backoff = RETRY_BACKOFF_MS[attempt - 1];
        const delay = Math.round(backoff * (0.75 + Math.random() * 0.5));
        if (performance.now() - started + delay >= timeoutMs) {
          throw fail(`${failed}; no time left to retry within ${timeoutMs} ms`);
        }
        console.warn(
          `[mfe-loader] "${entry.tag}" ${diagnosis.reason}; retry ${attempt}/${RETRY_BACKOFF_MS.length} in ${delay} ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * Injects one `<script type="module">` and settles on whichever comes first:
 * the element is defined, the script fails to load (network, HTTP, SRI), the
 * bundle throws while evaluating, or the budget runs out.
 */
function runScript(
  src: string,
  integrity: string | undefined,
  defined: Promise<unknown>,
  budget: AbortSignal,
): Promise<AttemptOutcome> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (outcome: AttemptOutcome) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("error", onWindowError);
      budget.removeEventListener("abort", onTimeout);
      resolve(outcome);
    };
    // An exception thrown while the bundle evaluates is reported to window with
    // the bundle URL as filename: fail fast instead of waiting for the timeout.
    const onWindowError = (e: ErrorEvent) => {
      if (e.filename === src) settle({ kind: "threw", message: e.message });
    };
    const onTimeout = () => settle({ kind: "timeout" });
    if (budget.aborted) return onTimeout();
    window.addEventListener("error", onWindowError);
    budget.addEventListener("abort", onTimeout);

    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = "anonymous";
    }
    // Fired for network errors, HTTP errors and SRI mismatches alike.
    script.onerror = () => {
      script.remove();
      settle({ kind: "load-error" });
    };
    void defined.then(() => settle({ kind: "defined" }));
    document.head.appendChild(script);
  });
}

/**
 * Classifies a failed script load by fetching the same URL once more. Runs
 * only after a failure, so a healthy page makes no extra requests.
 */
async function diagnose(
  src: string,
  integrity: string | undefined,
  budget: AbortSignal,
): Promise<Diagnosis> {
  let res: Response;
  try {
    res = await fetch(src, { cache: "no-store", signal: budget });
  } catch {
    return { transient: true, reason: "network error" };
  }
  if (!res.ok) {
    const transient =
      res.status >= 500 || res.status === 408 || res.status === 429;
    return { transient, reason: `HTTP ${res.status}` };
  }
  if (integrity) {
    const verdict = await verifyIntegrity(await res.arrayBuffer(), integrity);
    if (verdict !== "match") {
      return { transient: false, reason: `integrity ${verdict}` };
    }
  } else {
    const type = res.headers.get("content-type") ?? "no content-type";
    if (!/javascript|ecmascript/i.test(type)) {
      return { transient: false, reason: `not JavaScript (${type})` };
    }
  }
  // Served correctly now, so the failed attempt hit a transient fault.
  return { transient: true, reason: "transient load error" };
}

const SRI_ALGORITHMS = {
  sha256: "SHA-256",
  sha384: "SHA-384",
  sha512: "SHA-512",
} as const;

/** Checks bytes against an SRI value, using its strongest algorithm as browsers do. */
async function verifyIntegrity(
  bytes: ArrayBuffer,
  integrity: string,
): Promise<"match" | "mismatch" | "unverifiable"> {
  const hashes = integrity
    .trim()
    .split(/\s+/)
    .map((token) => /^(sha256|sha384|sha512)-([A-Za-z0-9+/=]+)/.exec(token))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ alg: m[1] as keyof typeof SRI_ALGORITHMS, hash: m[2] }));
  // "sha256" < "sha384" < "sha512" alphabetically, too.
  const strongest = hashes
    .map((h) => h.alg)
    .sort()
    .at(-1);
  if (!strongest || !globalThis.crypto?.subtle) return "unverifiable";
  const digest = await crypto.subtle.digest(SRI_ALGORITHMS[strongest], bytes);
  const actual = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return hashes.some((h) => h.alg === strongest && h.hash === actual)
    ? "match"
    : "mismatch";
}

function withParam(url: string, name: string, value: number): string {
  const u = new URL(url);
  u.searchParams.set(name, String(value));
  return u.href;
}
