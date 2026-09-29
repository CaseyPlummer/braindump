import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { App } from "./app/app";
import { captureOverridesFromUrl } from "./app/mfe-overrides";

// Persist and strip `?mfe-override=` before the router reads the URL.
captureOverridesFromUrl();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
