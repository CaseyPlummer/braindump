/**
 * Per-request configuration the host's Express server hands to Angular SSR through
 * `REQUEST_CONTEXT`. Keeping fragment URLs and the timeout in the server (env vars)
 * means the browser bundle never learns internal fragment endpoints.
 */
export interface FragmentContext {
  /** Custom-element tag -> fragment endpoint, e.g. `mfe-orders` -> `http://localhost:8150/fragment`. */
  fragmentUrls: Record<string, string>;
  /** Budget for each fragment fetch; on expiry the element is sent empty. */
  timeoutMs: number;
  /** Label for server logs. */
  hostName: string;
}
