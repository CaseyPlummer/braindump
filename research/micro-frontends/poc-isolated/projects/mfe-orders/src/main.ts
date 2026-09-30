import { createApplication } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import { provideBrowserGlobalErrorListeners } from "@angular/core";
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import type { MfeOrdersContract } from "@mfe/orders-contract";
import { assertSdkMajor } from "@platform/sdk";
import { platformAuthInterceptor } from "@platform/angular/http";
import { provideHostOwnedRouting } from "@platform/angular/routing";
import { ORDERS_ROUTES } from "./app/pages";
import { OrdersShell } from "./app/shell";

// Fail during module evaluation (before any async work) if the host serves an
// incompatible SDK major; the host's loader turns that into fallback UI.
assertSdkMajor(1, "mfe-orders");

/**
 * The "orders" domain MFE: a self-contained Angular application (its own
 * runtime) registered as <mfe-orders>, with internal routes whose URL the host
 * owns. See projects/platform-angular/src/routing.ts for the routing contract.
 */
void (async () => {
  const app = await createApplication({
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideHttpClient(
        withFetch(),
        withInterceptors([platformAuthInterceptor]),
      ),
      ...provideHostOwnedRouting(ORDERS_ROUTES),
    ],
  });
  customElements.define(
    "mfe-orders" satisfies MfeOrdersContract["tag"],
    createCustomElement(OrdersShell, { injector: app.injector }),
  );
})();
