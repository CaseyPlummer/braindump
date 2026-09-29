import {
  withNativeFederation,
  shareAll,
  autoShareScope,
} from "@angular-architects/native-federation-v4/config";

// Used only by the federated build (angular.json project "mfe-orders-ng21-federated").
export default withNativeFederation({
  name: "mfe-orders-ng21",

  exposes: {
    "./web-component": "./projects/mfe-orders-ng21/src/web-component.ts",
  },

  // Version-scoped sharing: "ng21" here, so it never shares with the "ng22" host.
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
