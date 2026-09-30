import { createApplication } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import {
  Component,
  VERSION,
  computed,
  inject,
  input,
  output,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  signal,
} from "@angular/core";
import {
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import type { CartCheckoutDetail, MfeCartContract } from "@mfe/cart-contract";
import { PlatformEvents, assertSdkMajor, bus } from "@platform/sdk";
import { Platform, onPlatformEvent } from "@platform/angular";
import type { AssertConforms, ContractCheck } from "@platform/angular/contract";
import { platformAuthInterceptor } from "@platform/angular/http";

assertSdkMajor(1, "mfe-cart-ng21");

type CartLine = PlatformEvents["cart.itemAdded@1"];

/**
 * A mini-cart MFE built on Angular 21 — one major behind the host and the other
 * MFEs. It uses the same platform contract: contexts (session, locale, theme,
 * flags), the token provider (via the HTTP interceptor) and the event bus. It
 * both consumes `cart.itemAdded@1` from the Angular 22 orders MFE and publishes
 * its own events that the orders MFE receives. Its element API (`currency` in,
 * `checkout` out) is published as `@mfe/cart-contract` (contracts/cart/), the
 * same framework-agnostic package the Angular 22 host compiles against.
 */
@Component({
  selector: "app-cart",
  providers: [Platform],
  host: {
    "[attr.data-theme]": "platform.theme()?.mode ?? 'light'",
    "[style.--accent]": "platform.theme()?.accent",
  },
  template: `
    <section class="mfe">
      <h3>
        Cart <small>(Angular {{ version }})</small>
      </h3>
      <p class="meta" data-testid="cart-session">
        {{ platform.session()?.user?.name ?? "anonymous" }} ·
        {{ platform.session()?.tenant?.name ?? "no tenant" }} ·
        {{ platform.locale() ?? "—" }} · {{ platform.theme()?.mode ?? "—" }}
      </p>
      @if (lines().length) {
        <ul data-testid="cart-lines">
          @for (line of lines(); track line.sku) {
            <li>
              {{ line.qty }} × {{ line.name }} —
              {{ money(line.unitPrice * line.qty) }}
            </li>
          }
        </ul>
        <p>
          Total: <strong data-testid="cart-total">{{ money(total()) }}</strong>
        </p>
      } @else {
        <p class="meta" data-testid="cart-lines">Cart is empty.</p>
      }
      <p class="actions">
        @if (recommendations()) {
          <button (click)="addRecommended()">
            Add recommended: Cable organiser
          </button>
        }
        <button (click)="clear()">Clear cart</button>
        <button (click)="requestCheckout()" [disabled]="!lines().length">
          Checkout
        </button>
        <button (click)="sync()">Sync with API</button>
      </p>
      @if (api(); as api) {
        <code data-testid="cart-api">{{ api }}</code>
      }
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
      border: 1px dashed var(--accent);
      border-radius: 8px;
      background: var(--bg);
      color: var(--fg);
    }
    h3 {
      margin: 0 0 4px;
    }
    small,
    .meta {
      font-weight: normal;
      color: var(--muted);
      font-size: 13px;
    }
    ul {
      margin: 4px 0;
      padding-left: 18px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    button {
      cursor: pointer;
    }
    code {
      font-size: 12px;
      word-break: break-all;
    }
  `,
})
export class CartComponent {
  protected readonly platform = inject(Platform);
  private readonly http = inject(HttpClient);
  protected readonly version = VERSION.full;
  protected readonly lines = signal<CartLine[]>([]);
  protected readonly total = computed(() =>
    this.lines().reduce((sum, l) => sum + l.qty * l.unitPrice, 0),
  );
  protected readonly recommendations = this.platform.flag(
    "cart.recommendations",
  );
  protected readonly api = signal<string | null>(null);

  readonly currency = input("EUR");
  readonly checkout = output<CartCheckoutDetail>();

  constructor() {
    // The cart state is derived from bus events, including the ones it publishes.
    onPlatformEvent("cart.itemAdded@1", (item) =>
      this.lines.update((lines) => {
        const existing = lines.find((l) => l.sku === item.sku);
        return existing
          ? lines.map((l) =>
              l === existing ? { ...l, qty: l.qty + item.qty } : l,
            )
          : [...lines, { ...item }];
      }),
    );
    onPlatformEvent("cart.cleared@1", () => this.lines.set([]));
  }

  money(amount: number): string {
    return new Intl.NumberFormat(this.platform.locale() ?? "en-US", {
      style: "currency",
      currency: this.currency(),
    }).format(amount);
  }

  requestCheckout(): void {
    this.checkout.emit({
      items: this.lines().reduce((sum, l) => sum + l.qty, 0),
      total: this.total(),
      currency: this.currency(),
    });
  }

  addRecommended(): void {
    bus.publish(
      "cart.itemAdded@1",
      { sku: "SKU-900", name: "Cable organiser", qty: 1, unitPrice: 12 },
      "mfe-cart-ng21",
    );
  }

  clear(): void {
    bus.publish("cart.cleared@1", {}, "mfe-cart-ng21");
  }

  sync(): void {
    this.api.set("loading…");
    this.http
      .get<{ authorization: string | null }>("/api/echo?resource=cart", {
        headers: { "X-Caller": "mfe-cart-ng21" },
      })
      .subscribe({
        next: (r) =>
          this.api.set(`Authorization: ${r.authorization ?? "(none)"}`),
        error: (e: unknown) => this.api.set(`error: ${String(e)}`),
      });
  }
}

void (async () => {
  const app = await createApplication({
    providers: [
      provideZonelessChangeDetection(),
      provideBrowserGlobalErrorListeners(),
      provideHttpClient(
        withFetch(),
        withInterceptors([platformAuthInterceptor]),
      ),
    ],
  });
  customElements.define(
    "mfe-cart-ng21" satisfies MfeCartContract["tag"],
    createCustomElement(CartComponent, { injector: app.injector }),
  );
})();

/** Compile-time proof that the element's API is exactly `@mfe/cart-contract`. */
export type CartContractConformance = AssertConforms<
  ContractCheck<CartComponent, MfeCartContract>
>;
