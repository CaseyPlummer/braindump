import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";
import { PlatformLocation } from "@angular/common";
import { ElementLoader, HOST_INFO } from "./element-loader";
import { MfeFragment } from "./mfe-fragment.directive";

/** The MFEs this page composes (both implement the same orders contract). */
const MFE_TAGS = ["mfe-orders", "mfe-orders-ng21"];

/**
 * Host shell shared by both hosts. Server-rendered and hydrated by the host's own
 * Angular; each <mfe-*> element receives server-rendered light DOM from its MFE
 * (MfeFragment) and is upgraded in the browser by the ElementLoader.
 */
@Component({
  selector: "app-root",
  imports: [MfeFragment],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  private readonly loader = inject(ElementLoader);
  readonly info = inject(HOST_INFO);

  /** Host -> MFE input. Seeded from `?customer=` so server and client agree. */
  readonly customer = signal(
    new URLSearchParams(inject(PlatformLocation).search).get("customer") ??
      "ACME Corp",
  );
  /** MFE -> host event value. */
  readonly lastOrder = signal<string | null>(null);
  /** Tags whose element is defined in the browser (client takeover done). */
  readonly defined = signal<string[]>([]);

  constructor() {
    // Browser only, after hydration: define the elements. Upgrading an element
    // replaces the server fragment inside it with the client render.
    afterNextRender(() => {
      for (const tag of MFE_TAGS) {
        this.loader
          .load(tag)
          .then(() => this.defined.update((d) => [...d, tag]))
          .catch((err) => console.error(`Failed to load ${tag}`, err));
      }
    });
  }

  onCustomerInput(event: Event): void {
    this.customer.set((event.target as HTMLInputElement).value);
  }

  onOrderSelected(event: Event): void {
    this.lastOrder.set((event as CustomEvent<string>).detail);
  }
}
