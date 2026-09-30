import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import type { MfeCartEventMap } from "@mfe/cart-contract";
import { BusEnvelope, bus } from "@platform/sdk";
import { HostState } from "./host-state";
import { MfeCartBinding, MfeProfileBinding } from "./mfe-bindings";
import { MfeFallback } from "./mfe-fallback";
import { MfeLoaderService } from "./mfe-loader.service";
import { clearOverrides, readOverrides } from "./mfe-overrides";
import { PlatformHost } from "./platform-host.service";

/** Demo failure scenarios: `?manifest=broken`, `faulty` or `flaky` (see assemble.mjs). */
function manifestUrl(): string {
  const scenario = new URLSearchParams(location.search).get("manifest");
  return scenario && /^[a-z]+$/.test(scenario)
    ? `mfes/manifest.${scenario}.json`
    : "mfes/manifest.json";
}

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MfeFallback,
    MfeProfileBinding,
    MfeCartBinding,
  ],
  // CUSTOM_ELEMENTS_SCHEMA lets the host template use unknown <mfe-*> tags and
  // bind their inputs/events without Angular knowing they are Angular.
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { "[attr.data-theme]": "platform.themeMode()" },
  styles: `
    :host {
      display: block;
      font:
        15px/1.5 system-ui,
        sans-serif;
      max-width: 1040px;
      margin: 0 auto;
      padding: 16px;
      color: #222;
      background: #fff;
      min-height: 100vh;
      box-sizing: border-box;
    }
    :host([data-theme="dark"]) {
      color: #e8e8e8;
      background: #14161a;
    }
    header {
      border-bottom: 1px solid #8884;
      margin-bottom: 12px;
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px 20px;
    }
    h1 {
      margin: 0;
      font-size: 22px;
    }
    nav a {
      margin-right: 12px;
      color: inherit;
    }
    nav a.active {
      font-weight: 600;
    }
    .controls {
      background: #8881;
      padding: 10px 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px 18px;
    }
    .override {
      background: #c77700;
      color: #fff;
      padding: 6px 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      gap: 16px;
    }
    @media (max-width: 760px) {
      .layout {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    aside {
      display: grid;
      gap: 12px;
      align-content: start;
    }
    .log {
      font-size: 12px;
      margin: 0;
      padding-left: 18px;
    }
    .muted {
      color: #888;
      font-size: 13px;
    }
  `,
})
export class App implements OnInit {
  protected readonly loader = inject(MfeLoaderService);
  protected readonly platform = inject(PlatformHost);
  protected readonly state = inject(HostState);
  protected readonly overrides = Object.entries(readOverrides());
  protected readonly events = signal<BusEnvelope[]>([]);
  protected readonly cartCount = signal(0);
  protected readonly checkoutSummary = computed(() => {
    const checkout = this.state.lastCheckout();
    if (!checkout) return "—";
    const total = new Intl.NumberFormat(this.platform.locale(), {
      style: "currency",
      currency: checkout.currency,
    }).format(checkout.total);
    return `${checkout.items} item(s), ${total}`;
  });

  constructor() {
    // Serve session, locale, theme, flags and the token provider to every MFE
    // rendered inside the host element.
    this.platform.provideTo(inject(ElementRef<Element>).nativeElement);

    const off = bus.subscribe("*", (payload, envelope) => {
      this.events.update((list) => [envelope, ...list].slice(0, 6));
      if (envelope.type === "cart.itemAdded@1") {
        this.cartCount.update((n) => n + (payload as { qty: number }).qty);
      } else if (envelope.type === "cart.cleared@1") {
        this.cartCount.set(0);
      }
    });
    inject(DestroyRef).onDestroy(off);
  }

  ngOnInit(): void {
    void this.loader.loadManifest(manifestUrl());
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  protected onCheckout(event: MfeCartEventMap["checkout"]): void {
    this.state.lastCheckout.set(event.detail);
  }

  protected clearOverrides(): void {
    clearOverrides();
    location.reload();
  }

  protected describe(envelope: BusEnvelope): string {
    return `${envelope.type} from ${envelope.source}: ${JSON.stringify(envelope.payload)}`;
  }
}
