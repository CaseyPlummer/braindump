import { InjectionToken } from "@angular/core";

/**
 * How the browser gets a custom element defined. The two hosts differ only here:
 * the Isolated host injects each MFE's own bundle, the Shared host loads
 * each remote's exposed module through Native Federation.
 */
export abstract class ElementLoader {
  abstract load(tag: string): Promise<void>;
}

/** Text shown in the host header, so the two hosts are easy to tell apart. */
export interface HostInfo {
  name: string;
  description: string;
}

export const HOST_INFO = new InjectionToken<HostInfo>("HOST_INFO");
