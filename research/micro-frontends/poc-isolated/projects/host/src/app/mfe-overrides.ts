import { isDevMode } from "@angular/core";

/**
 * Local-dev manifest override: point one MFE at a locally served bundle while
 * the rest of the page uses the published manifest.
 *
 *   /?mfe-override=mfe-orders=http://localhost:4201/main.js   set (persisted)
 *   /?mfe-override=mfe-orders=                                remove one
 *   /?mfe-override=reset                                      remove all
 *
 * Overrides persist in localStorage, are honoured only on a loopback host or in a
 * dev build, and may only target loopback URLs — a crafted link cannot swap a
 * production MFE for a remote script. Overridden entries drop their `integrity`,
 * since a local build never matches the published hash.
 */
const STORAGE_KEY = "mfe-overrides";
const PARAM = "mfe-override";
const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);
const TAG = /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/;

export type Overrides = Record<string, string>;

export function overridesAllowed(): boolean {
  return isDevMode() || LOOPBACK.has(location.hostname);
}

function isLoopbackUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      LOOPBACK.has(url.hostname)
    );
  } catch {
    return false;
  }
}

export function readOverrides(): Overrides {
  if (!overridesAllowed()) return {};
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return Object.fromEntries(
      Object.entries(stored as Overrides).filter(
        ([tag, url]) => TAG.test(tag) && isLoopbackUrl(url),
      ),
    );
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Overrides): void {
  try {
    if (Object.keys(overrides).length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode, blocked): overrides simply don't persist.
  }
}

export function clearOverrides(): void {
  writeOverrides({});
}

/**
 * Reads `?mfe-override=` params, persists them and removes them from the address
 * bar. Runs before the host router starts so the router never sees them.
 */
export function captureOverridesFromUrl(): void {
  const url = new URL(location.href);
  const values = url.searchParams.getAll(PARAM);
  if (!values.length) return;
  url.searchParams.delete(PARAM);
  history.replaceState(history.state, "", url);
  if (!overridesAllowed()) {
    console.warn(
      "[mfe-override] ignored: only honoured on localhost or dev builds",
    );
    return;
  }
  let overrides = readOverrides();
  for (const value of values) {
    if (value === "reset") {
      overrides = {};
      continue;
    }
    const eq = value.indexOf("=");
    const tag = eq > 0 ? value.slice(0, eq) : "";
    const target = eq > 0 ? value.slice(eq + 1) : "";
    if (!TAG.test(tag)) {
      console.warn(`[mfe-override] ignored "${value}": expected <tag>=<url>`);
    } else if (!target) {
      delete overrides[tag];
    } else if (!isLoopbackUrl(target)) {
      console.warn(
        `[mfe-override] ignored "${value}": URL must be on localhost`,
      );
    } else {
      overrides[tag] = target;
    }
  }
  writeOverrides(overrides);
}
