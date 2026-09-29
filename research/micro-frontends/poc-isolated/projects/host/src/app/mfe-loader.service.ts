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
  /** How long to wait for the element to be defined. Default 10 000 ms. */
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

/**
 * Discovers MFEs from the manifest and loads each self-contained bundle with a
 * `<script type="module">`. No federation, no shared runtime.
 *
 * Resilience: every MFE loads independently with its own timeout; a network
 * error, SRI mismatch, evaluation error or timeout marks only that MFE as
 * `failed` (the host renders fallback UI in its slot) and never blocks the
 * others. Each tag is loaded at most once.
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

  private inject(entry: MfeManifestEntry): Promise<void> {
    if (customElements.get(entry.tag)) {
      return Promise.reject(
        new Error(`"${entry.tag}" is already defined by another bundle`),
      );
    }
    const url = new URL(entry.url, document.baseURI).href;
    const timeoutMs = entry.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const settle = (error?: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        window.removeEventListener("error", onWindowError);
        if (error) reject(new Error(`MFE "${entry.tag}" ${error}`));
        else resolve();
      };
      const timer = setTimeout(
        () => settle(`was not defined within ${timeoutMs} ms`),
        timeoutMs,
      );
      // An exception thrown while the bundle evaluates is reported to window with
      // the bundle URL as filename: fail fast instead of waiting for the timeout.
      const onWindowError = (e: ErrorEvent) => {
        if (e.filename === url) settle(`threw while loading: ${e.message}`);
      };
      window.addEventListener("error", onWindowError);

      const script = document.createElement("script");
      script.type = "module";
      script.src = url;
      if (entry.integrity) {
        script.integrity = entry.integrity;
        script.crossOrigin = "anonymous";
      }
      // Fired for network errors, HTTP errors and SRI mismatches alike.
      script.onerror = () =>
        settle(
          `failed to load ${entry.url}${entry.integrity ? " (network error or integrity mismatch)" : ""}`,
        );
      // The element is registered inside the MFE's async bootstrap, so wait for
      // whenDefined rather than the script's load event.
      customElements.whenDefined(entry.tag).then(() => settle());
      document.head.appendChild(script);
    });
  }
}
