import { Injectable, signal } from "@angular/core";

/** Host-owned UI state shared between the shell and routed host pages. */
@Injectable({ providedIn: "root" })
export class HostState {
  /** Host → MFE: an input passed down to the orders MFE. */
  readonly customer = signal("ACME Corp");
  /** MFE → host: the last value received from the orders MFE's DOM event. */
  readonly lastOrder = signal<string | null>(null);
}
