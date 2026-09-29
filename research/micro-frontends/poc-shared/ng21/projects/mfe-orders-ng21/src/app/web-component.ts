import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { OrdersComponent } from './orders';

let registered = false;

/**
 * Registers <mfe-orders-ng21>. The custom-element registry is global to the
 * page, so this Angular 21 build of the orders MFE needs its own tag next to the
 * Angular 22 <mfe-orders>. Its share scope ("ng21") differs from the host's
 * ("ng22"), so `createApplication()` here runs on this remote's own Angular 21
 * runtime, not the host's.
 */
export async function register(): Promise<void> {
  if (registered) return;
  registered = true;
  const app = await createApplication();
  customElements.define(
    'mfe-orders-ng21',
    createCustomElement(OrdersComponent, { injector: app.injector }),
  );
}
