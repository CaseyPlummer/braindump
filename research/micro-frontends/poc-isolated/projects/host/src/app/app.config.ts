import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";

// Zoneless by default in Angular 22 — no zone.js, no change-detection provider needed.
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
};
