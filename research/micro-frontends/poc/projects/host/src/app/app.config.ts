import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";

// Zoneless by default in Angular 22 — no zone.js, no change-detection provider needed.
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
