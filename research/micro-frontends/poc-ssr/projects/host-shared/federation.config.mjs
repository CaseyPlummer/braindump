import {
  withNativeFederation,
  shareAll,
  autoShareScope,
} from "@angular-architects/native-federation/config";

// Browser-side federation for the Shared host. The host's server bundle is an
// ordinary Angular SSR build: it never loads remotes, only fetches HTML fragments.
export default withNativeFederation({
  name: "host-shared",

  shareScope: autoShareScope({ level: "major" }),

  shared: {
    ...shareAll(
      {
        singleton: true,
        strictVersion: true,
        requiredVersion: "auto",
        build: "package",
      },
      {
        overrides: {
          "@angular/core": {
            singleton: true,
            strictVersion: true,
            requiredVersion: "auto",
            build: "package",
            includeSecondaries: { keepAll: true },
          },
        },
      },
    ),
  },

  skip: ["rxjs/ajax", "rxjs/fetch", "rxjs/testing", "rxjs/webSocket"],

  features: { denseChunking: true },
});
