import { provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { OrdersComponent } from './orders';

let registered = false;

/**
 * Registers <mfe-orders-ng20>. The custom-element registry is global to the
 * page, so this Angular 20 build of the orders MFE needs its own tag next to the
 * Angular 22 <mfe-orders>. Its share scope ("ng20") differs from the host's
 * ("ng22"), so `createApplication()` here runs on this remote's own Angular 20
 * runtime, not the host's.
 *
 * Angular 20 still defaults to zone-based change detection, and no page in this
 * POC loads zone.js, so zoneless (stable since Angular 20) is opted into here.
 */
export async function register(): Promise<void> {
  if (registered) return;
  registered = true;
  const app = await createApplication({ providers: [provideZonelessChangeDetection()] });
  customElements.define(
    'mfe-orders-ng20',
    createCustomElement(OrdersComponent, { injector: app.injector }),
  );
}
