import { APP_ID } from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import { OrdersComponent } from "./app/orders";
import { ORDERS_APP_ID } from "./app/app-id";

let registered = false;

/**
 * Native Federation exposed module (`./web-component`). The Shared host calls
 * `register()` after `loadRemoteModule`; `createApplication()` then runs on the
 * Angular runtime shared through federation when host and remote share a major; this Angular 21 remote is in its own
 * "ng21" scope, so it runs on its own Angular.
 * The element and its takeover of server markup are identical to main.ts.
 */
export async function register(): Promise<void> {
  if (registered) return;
  registered = true;
  const app = await createApplication({
    providers: [{ provide: APP_ID, useValue: ORDERS_APP_ID }],
  });
  customElements.define(
    "mfe-orders-ng21",
    createCustomElement(OrdersComponent, { injector: app.injector }),
  );
}
