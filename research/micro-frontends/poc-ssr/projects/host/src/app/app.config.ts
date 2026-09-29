import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import {
  provideClientHydration,
  withEventReplay,
} from "@angular/platform-browser";
import { ElementLoader, HOST_INFO } from "../../../shell/element-loader";
import { ScriptElementLoader } from "./script-element-loader";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    { provide: ElementLoader, useClass: ScriptElementLoader },
    {
      provide: HOST_INFO,
      useValue: {
        name: "Isolated-runtime takeover",
        description:
          "Angular SSR host. Each MFE element arrives with server-rendered HTML from its " +
          "own fragment endpoint; its self-contained bundle then boots and takes over.",
      },
    },
  ],
};
