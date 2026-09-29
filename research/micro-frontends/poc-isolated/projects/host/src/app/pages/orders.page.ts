import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, UrlSegment } from "@angular/router";
import { combineLatest, map } from "rxjs";
import { HostState } from "../host-state";
import { MfeFallback } from "../mfe-fallback";
import { MfeLoaderService } from "../mfe-loader.service";

/** Everything under `/orders` belongs to the orders MFE. */
export const ORDERS_BASE = "/orders";

export function ordersMatcher(segments: UrlSegment[]) {
  return segments[0]?.path === "orders" ? { consumed: segments } : null;
}

/**
 * Host page for `/orders/**`. Translates the host URL into the MFE's `route`
 * input and applies the MFE's `navigate` events to the address bar. The host
 * router is the only one that touches `window.history` or reacts to popstate.
 */
@Component({
  selector: "app-orders-page",
  imports: [MfeFallback],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @switch (loader.state("mfe-orders")) {
      @case ("ready") {
        <mfe-orders
          base="/orders"
          [route]="subRoute()"
          [customer]="state.customer()"
          (navigate)="onNavigate($event)"
          (orderSelected)="onOrderSelected($event)"
        ></mfe-orders>
      }
      @case ("failed") {
        <app-mfe-fallback tag="mfe-orders" label="Orders" />
      }
      @default {
        <p>Loading orders…</p>
      }
    }
  `,
})
export class OrdersPage {
  protected readonly loader = inject(MfeLoaderService);
  protected readonly state = inject(HostState);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** The part of the host URL after `/orders`, e.g. `/1002` (with query string). */
  protected readonly subRoute = toSignal(
    combineLatest([this.route.url, this.route.queryParams]).pipe(
      map(([segments, queryParams]) =>
        this.router.serializeUrl(
          this.router.createUrlTree(
            ["/", ...segments.slice(1).map((s) => s.path)],
            { queryParams },
          ),
        ),
      ),
    ),
    { initialValue: "/" },
  );

  onNavigate(event: Event): void {
    const { path, replace } = (
      event as CustomEvent<{ path: string; replace?: boolean }>
    ).detail;
    const target = this.toHostUrl(path);
    if (this.router.url !== target) {
      void this.router.navigateByUrl(target, { replaceUrl: !!replace });
    }
  }

  onOrderSelected(event: Event): void {
    this.state.lastOrder.set((event as CustomEvent<string>).detail);
  }

  /** `/` → `/orders`, `/?q=1` → `/orders?q=1`, `/1002` → `/orders/1002`. */
  private toHostUrl(path: string): string {
    const root = path === "" || path === "/" || path.startsWith("/?");
    return root ? `${ORDERS_BASE}${path.slice(1)}` : `${ORDERS_BASE}${path}`;
  }
}
