import {
  Component,
  EventEmitter,
  Input,
  Output,
  PLATFORM_ID,
  VERSION,
  inject,
} from "@angular/core";
import { isPlatformServer } from "@angular/common";

/**
 * The "orders" domain component. The same class is rendered three ways:
 *  - on the server, to an HTML fragment (main.server.ts, served by server.ts)
 *  - in the browser as the self-contained <mfe-orders> element (main.ts)
 *  - in the browser as a Native Federation remote (web-component.ts)
 * Contract over the DOM: input `customer` down, `orderSelected` CustomEvent up.
 * `data-rendered` records which side produced the markup, so a test can see the
 * client take over the server fragment without any visible change; `elementtiming`
 * lets a test measure when the heading first paints (Element Timing API).
 */
@Component({
  selector: "app-orders",
  template: `
    <section class="mfe" [attr.data-rendered]="renderedBy">
      <h3 elementtiming="mfe-heading">Orders for {{ customer }}</h3>
      <p class="meta">Angular {{ version }} · three most recent orders</p>
      <ul>
        @for (o of orders; track o.id) {
          <li>
            <button type="button" (click)="select(o.id)">
              Select {{ o.id }}
            </button>
            <span>{{ o.item }}</span>
            <span class="total">{{ o.total }}</span>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .mfe {
      padding: 12px 16px;
      border: 1px solid #888;
      border-radius: 8px;
      background: #fff;
    }
    h3 {
      margin: 0 0 4px;
      font-size: 1.25rem;
    }
    .meta {
      margin: 0 0 8px;
      color: #666;
      font-size: 0.85rem;
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 6px 0;
      border-top: 1px solid #eee;
    }
    .total {
      margin-left: auto;
      font-variant-numeric: tabular-nums;
    }
    button {
      cursor: pointer;
    }
  `,
})
export class OrdersComponent {
  @Input() customer = "guest";
  @Output() orderSelected = new EventEmitter<string>();

  readonly version = VERSION.full;
  readonly renderedBy = isPlatformServer(inject(PLATFORM_ID))
    ? "server"
    : "client";
  readonly orders = [
    { id: "#1001", item: "Standing desk, oak top", total: "$640.00" },
    { id: "#1002", item: "Monitor arm, dual", total: "$129.00" },
    { id: "#1003", item: "Desk lamp, warm white", total: "$48.50" },
  ];

  select(id: string): void {
    this.orderSelected.emit(id);
  }
}
