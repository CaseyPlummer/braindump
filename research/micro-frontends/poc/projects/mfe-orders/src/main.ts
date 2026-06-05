import { createApplication } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";

/**
 * A self-contained "orders" domain MFE. It exposes a typed contract over the DOM:
 *  - input  `customer` (Angular @Input  -> element property/attribute)
 *  - output `orderSelected` (Angular @Output -> DOM CustomEvent)
 * The host binds these without knowing the element is Angular.
 */
@Component({
  selector: "app-orders",
  template: `
    <section class="mfe">
      <h3>Orders — {{ customer }}</h3>
      <ul>
        @for (id of orders; track id) {
          <li>
            <button (click)="select(id)">Select {{ id }}</button>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .mfe {
      padding: 12px;
      border: 1px solid #888;
      border-radius: 8px;
    }
    h3 {
      margin: 0 0 8px;
    }
    ul {
      margin: 0;
      padding-left: 18px;
    }
    button {
      cursor: pointer;
    }
  `,
})
export class OrdersComponent {
  @Input() customer = "guest";
  @Output() orderSelected = new EventEmitter<string>();
  readonly orders = ["#1001", "#1002", "#1003"];

  select(id: string): void {
    this.orderSelected.emit(id);
  }
}

void (async () => {
  const app = await createApplication({
    providers: [provideBrowserGlobalErrorListeners()],
  });
  customElements.define(
    "mfe-orders",
    createCustomElement(OrdersComponent, { injector: app.injector }),
  );
})();
