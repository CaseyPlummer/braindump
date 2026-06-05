import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";

// Angular 21+ is zoneless by default — no zone.js, no explicit change-detection
// provider needed. Add app-wide providers (HTTP, router, etc.) here as the MFE grows.
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
