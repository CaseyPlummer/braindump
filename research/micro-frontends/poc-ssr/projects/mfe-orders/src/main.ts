import { createApplication } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import { APP_ID, provideBrowserGlobalErrorListeners } from "@angular/core";
import { OrdersComponent } from "./app/orders";
import { ORDERS_APP_ID } from "./app/app-id";

// Isolated-runtime browser build: registers <mfe-orders> with its own Angular runtime.
// When the element upgrades over server-spliced markup, Angular Elements creates the
// component on the element and clears its existing children (this application does
// not enable hydration), so the client render replaces the fragment.
void (async () => {
  const app = await createApplication({
    providers: [
      provideBrowserGlobalErrorListeners(),
      { provide: APP_ID, useValue: ORDERS_APP_ID },
    ],
  });
  customElements.define(
    "mfe-orders",
    createCustomElement(OrdersComponent, { injector: app.injector }),
  );
})();
