import {
  Component,
  EventEmitter,
  Input,
  Output,
  VERSION,
  inject,
  isDevMode,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink, RouterOutlet } from "@angular/router";
import { Platform, onPlatformEvent } from "@platform/angular";
import { HostRouteSync, NavigateDetail } from "@platform/angular/routing";
import { Order } from "./orders.data";

/**
 * Root component of <mfe-orders>. Public contract (unchanged plus routing):
 *  - input  `customer`       host → MFE
 *  - output `orderSelected`  MFE → host (DOM CustomEvent, detail = "#1001")
 *  - input  `route`, `base`  host-owned URL → MFE router (see HostRouteSync)
 *  - output `navigate`       MFE router → host address bar
 * Platform contexts (session, locale, theme, flags, token) arrive through the
 * context protocol, not inputs.
 */
@Component({
  selector: "app-orders-shell",
  imports: [RouterOutlet, RouterLink],
  providers: [Platform, HostRouteSync],
  host: {
    "[attr.data-theme]": "platform.theme()?.mode ?? 'light'",
    "[style.--accent]": "platform.theme()?.accent",
  },
  template: `
    <section class="mfe">
      <header>
        <h3>
          <a routerLink="/">Orders</a> — {{ customer }}
          @if (devBuild) {
            <span class="badge">dev build</span>
          }
        </h3>
        <p class="meta">
          {{ platform.session()?.user?.name ?? "anonymous" }} ·
          {{ platform.session()?.tenant?.name ?? "no tenant" }} ·
          {{ platform.locale() ?? "—" }} · Angular {{ version }}
        </p>
        <p class="meta" data-testid="orders-cart">
          Cart activity seen: {{ cartItems() }} item(s)
          @if (lastCartSource()) {
            (last from {{ lastCartSource() }})
          }
        </p>
      </header>
      <router-outlet />
    </section>
  `,
  styles: `
    :host {
      display: block;
      --bg: #fff;
      --fg: #222;
      --muted: #666;
      --accent: #3558d6;
    }
    :host([data-theme="dark"]) {
      --bg: #1e2127;
      --fg: #e8e8e8;
      --muted: #a0a4ab;
    }
    .mfe {
      padding: 12px;
      border: 2px solid var(--accent);
      border-radius: 8px;
      background: var(--bg);
      color: var(--fg);
    }
    h3 {
      margin: 0;
    }
    h3 a {
      color: var(--accent);
    }
    .meta {
      margin: 2px 0;
      color: var(--muted);
      font-size: 13px;
    }
    .badge {
      font-size: 11px;
      background: #c77700;
      color: #fff;
      padding: 1px 6px;
      border-radius: 4px;
      vertical-align: middle;
    }
  `,
})
export class OrdersShell {
  protected readonly platform = inject(Platform);
  private readonly sync = inject(HostRouteSync);
  protected readonly version = VERSION.full;
  protected readonly devBuild = isDevMode();
  protected readonly cartItems = signal(0);
  protected readonly lastCartSource = signal<string | null>(null);

  @Input() customer = "guest";
  @Output() orderSelected = new EventEmitter<string>();
  @Output() navigate = new EventEmitter<NavigateDetail>();

  /** Mount path of this MFE in the host URL, e.g. `/orders`. */
  @Input() set base(value: string) {
    this.sync.setBase(value ?? "");
  }

  /** The MFE's sub-path, owned by the host, e.g. `/1002`. */
  @Input() set route(value: string) {
    this.sync.setRoute(value);
  }

  constructor() {
    this.sync.navigations
      .pipe(takeUntilDestroyed())
      .subscribe((detail) => this.navigate.emit(detail));

    onPlatformEvent("cart.itemAdded@1", (item, envelope) => {
      this.cartItems.update((n) => n + item.qty);
      this.lastCartSource.set(envelope.source);
    });
    onPlatformEvent("cart.cleared@1", (_, envelope) => {
      this.cartItems.set(0);
      this.lastCartSource.set(envelope.source);
    });
  }

  select(order: Order): void {
    this.orderSelected.emit(`#${order.id}`);
  }
}
