import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { OrdersComponent } from './orders';

let registered = false;

/**
 * Registers <mfe-orders-ng19>. The custom-element registry is global to the
 * page, so this Angular 19 build of the orders MFE needs its own tag next to the
 * Angular 22 <mfe-orders>. Built with the Native Federation v3 line, it has no
 * share scope: its Angular lands in the default scope, where nothing else offers
 * @angular/core, so `createApplication()` here runs on this remote's own Angular
 * 19 runtime as long as its URL is outside the host's import-map scope.
 *
 * Angular 19 defaults to zone-based change detection and no page in this POC
 * loads zone.js, so the (developer-preview) zoneless provider is opted into here.
 */
export async function register(): Promise<void> {
  if (registered) return;
  registered = true;
  const app = await createApplication({
    providers: [provideExperimentalZonelessChangeDetection()],
  });
  customElements.define(
    'mfe-orders-ng19',
    createCustomElement(OrdersComponent, { injector: app.injector }),
  );
}
