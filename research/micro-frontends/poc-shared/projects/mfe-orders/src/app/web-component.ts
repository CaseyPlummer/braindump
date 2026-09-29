import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { OrdersComponent } from './orders';

let registered = false;

/**
 * Registers the <mfe-orders> custom element. The host calls this after
 * `loadRemoteModule`. Crucially, `createApplication()` here uses the Angular
 * runtime **shared via Native Federation** — so when the host and this remote
 * are on a compatible Angular version, no second Angular is downloaded. The
 * web-component boundary is identical to Flavor 1; only the runtime is shared.
 */
export async function register(): Promise<void> {
  if (registered) return;
  registered = true;
  const app = await createApplication();
  customElements.define(
    'mfe-orders',
    createCustomElement(OrdersComponent, { injector: app.injector }),
  );
}
