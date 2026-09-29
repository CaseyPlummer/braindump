import { ApplicationConfig, mergeApplicationConfig } from "@angular/core";
import {
  RenderMode,
  ServerRoute,
  provideServerRendering,
  withRoutes,
} from "@angular/ssr";
import { appConfig } from "./app.config";

// Render every request on demand: fragments depend on request inputs.
const serverRoutes: ServerRoute[] = [
  { path: "**", renderMode: RenderMode.Server },
];

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
