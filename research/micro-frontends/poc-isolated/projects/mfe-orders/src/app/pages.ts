import { HttpClient } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink, Routes } from "@angular/router";
import { Platform } from "@platform/angular";
import { bus } from "@platform/sdk";
import { map } from "rxjs";
import {
  ORDERS,
  Order,
  formatDate,
  formatMoney,
  orderTotal,
} from "./orders.data";
import { OrdersShell } from "./shell";

/** Route `/` — the order list. */
@Component({
  selector: "app-order-list",
  imports: [RouterLink],
  template: `
    <ul>
      @for (order of orders; track order.id) {
        <li>
          <a [routerLink]="['/', order.id]">Order #{{ order.id }}</a>
          <span class="muted">{{ date(order) }}</span>
          @if (showTotals()) {
            <strong>{{ total(order) }}</strong>
          }
          <button (click)="shell.select(order)">Select #{{ order.id }}</button>
        </li>
      }
    </ul>
  `,
  styles: `
    ul {
      margin: 8px 0 0;
      padding-left: 18px;
    }
    li {
      margin: 4px 0;
    }
    a {
      color: var(--accent);
    }
    .muted {
      color: var(--muted);
      margin: 0 6px;
    }
    button {
      cursor: pointer;
      margin-left: 6px;
    }
  `,
})
export class OrderList {
  protected readonly shell = inject(OrdersShell);
  private readonly platform = inject(Platform);
  protected readonly orders = ORDERS;
  protected readonly showTotals = this.platform.flag("orders.showTotals");

  date(order: Order): string {
    return formatDate(this.platform.locale(), order.placed);
  }
  total(order: Order): string {
    return formatMoney(this.platform.locale(), orderTotal(order));
  }
}

interface EchoResponse {
  authorization: string | null;
  path: string;
}

/** Route `/:id` — one order, with an API call and a cross-MFE bus event. */
@Component({
  selector: "app-order-detail",
  imports: [RouterLink],
  template: `
    @if (order(); as order) {
      <h4>Order #{{ order.id }} · {{ date(order) }}</h4>
      <table>
        @for (line of order.lines; track line.sku) {
          <tr>
            <td>{{ line.qty }} ×</td>
            <td>{{ line.name }}</td>
            <td>{{ money(line.unitPrice) }}</td>
            <td>
              <button (click)="addToCart(line)">Add to cart</button>
            </td>
          </tr>
        }
      </table>
      @if (showTotals()) {
        <p>
          Total: <strong>{{ money(total(order)) }}</strong>
        </p>
      }
      <p>
        <button (click)="loadFromApi(order)">Load from API</button>
        @if (api(); as api) {
          <code data-testid="orders-api">{{ api }}</code>
        }
      </p>
      <nav>
        <a routerLink="/">← All orders</a>
        @if (next(); as next) {
          · <a [routerLink]="['/', next.id]">Next: #{{ next.id }} →</a>
        }
      </nav>
    } @else {
      <p>Order #{{ id() }} not found. <a routerLink="/">All orders</a></p>
    }
  `,
  styles: `
    h4 {
      margin: 8px 0 4px;
    }
    td {
      padding: 1px 6px 1px 0;
    }
    a {
      color: var(--accent);
    }
    code {
      font-size: 12px;
      margin-left: 6px;
      word-break: break-all;
    }
    button {
      cursor: pointer;
    }
  `,
})
export class OrderDetail {
  private readonly platform = inject(Platform);
  private readonly http = inject(HttpClient);
  protected readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get("id") ?? "")),
    { initialValue: "" },
  );
  protected readonly order = computed(() =>
    ORDERS.find((o) => o.id === this.id()),
  );
  protected readonly next = computed(() => {
    const i = ORDERS.findIndex((o) => o.id === this.id());
    return i >= 0 ? ORDERS[i + 1] : undefined;
  });
  protected readonly showTotals = this.platform.flag("orders.showTotals");
  protected readonly api = signal<string | null>(null);

  date(order: Order): string {
    return formatDate(this.platform.locale(), order.placed);
  }
  money(amount: number): string {
    return formatMoney(this.platform.locale(), amount);
  }
  total(order: Order): number {
    return orderTotal(order);
  }

  addToCart(line: Order["lines"][number]): void {
    bus.publish(
      "cart.itemAdded@1",
      { sku: line.sku, name: line.name, qty: 1, unitPrice: line.unitPrice },
      "mfe-orders",
    );
  }

  loadFromApi(order: Order): void {
    this.api.set("loading…");
    this.http
      .get<EchoResponse>(`/api/echo?resource=orders/${order.id}`, {
        headers: { "X-Caller": "mfe-orders" },
      })
      .subscribe({
        next: (r) =>
          this.api.set(`Authorization: ${r.authorization ?? "(none)"}`),
        error: (e: unknown) => this.api.set(`error: ${String(e)}`),
      });
  }
}

@Component({
  selector: "app-orders-not-found",
  imports: [RouterLink],
  template: `<p>No such page in Orders. <a routerLink="/">All orders</a></p>`,
})
export class OrdersNotFound {}

export const ORDERS_ROUTES: Routes = [
  { path: "", component: OrderList },
  { path: "all", redirectTo: "" },
  { path: ":id", component: OrderDetail },
  { path: "**", component: OrdersNotFound },
];
