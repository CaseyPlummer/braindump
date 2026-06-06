import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ProfileComponent } from './profile';

let registered = false;

/** Registers <mfe-profile> using the Angular runtime shared via Native Federation. */
export async function register(): Promise<void> {
  if (registered) return;
  registered = true;
  const app = await createApplication();
  customElements.define(
    'mfe-profile',
    createCustomElement(ProfileComponent, { injector: app.injector }),
  );
}
