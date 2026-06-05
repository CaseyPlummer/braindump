import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import { MfeLoaderService, MfeManifestEntry } from "./mfe-loader.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  // CUSTOM_ELEMENTS_SCHEMA lets the host template use unknown <mfe-*> tags and
  // bind their inputs/events without Angular knowing they are Angular.
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    :host {
      display: block;
      font:
        15px/1.5 system-ui,
        sans-serif;
      max-width: 760px;
      margin: 24px auto;
      padding: 0 16px;
    }
    header {
      border-bottom: 1px solid #ddd;
      margin-bottom: 16px;
    }
    .controls {
      background: #f6f6f6;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .grid {
      display: grid;
      gap: 12px;
    }
    input {
      padding: 4px 8px;
    }
  `,
})
export class App implements OnInit {
  private readonly loader = inject(MfeLoaderService);

  /** Tags that have finished loading — drives @if in the template. */
  readonly loaded = signal(new Set<string>());
  /** Host → MFE: an input we pass down to the orders MFE. */
  readonly customer = signal("ACME Corp");
  /** MFE → host: a value received from the orders MFE's DOM event. */
  readonly lastOrder = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    // Discover MFEs at runtime from the manifest (could be a CDN URL).
    const manifest: MfeManifestEntry[] = await fetch("mfes/manifest.json").then(
      (r) => r.json(),
    );
    for (const entry of manifest) {
      this.loader
        .load(entry)
        .then(() => this.loaded.update((s) => new Set(s).add(entry.tag)))
        .catch((err) => console.error(err));
    }
  }

  has(tag: string): boolean {
    return this.loaded().has(tag);
  }

  onCustomerInput(event: Event): void {
    this.customer.set((event.target as HTMLInputElement).value);
  }

  onOrderSelected(event: Event): void {
    this.lastOrder.set((event as CustomEvent<string>).detail);
  }
}
