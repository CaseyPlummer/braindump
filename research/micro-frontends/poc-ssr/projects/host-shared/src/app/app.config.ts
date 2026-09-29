import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import {
  provideClientHydration,
  withEventReplay,
} from "@angular/platform-browser";
import { ElementLoader, HOST_INFO } from "../../../shell/element-loader";
import { FederationElementLoader } from "./federation-element-loader";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    { provide: ElementLoader, useClass: FederationElementLoader },
    {
      provide: HOST_INFO,
      useValue: {
        name: "Shared-runtime takeover",
        description:
          "Angular SSR host. Each MFE element arrives with server-rendered HTML from its " +
          "own fragment endpoint; Native Federation then loads the remote, which takes " +
          "over on the shared Angular runtime (or its own, a major behind).",
      },
    },
  ],
};
