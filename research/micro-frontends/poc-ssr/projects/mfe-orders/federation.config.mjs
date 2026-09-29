import {
  withNativeFederation,
  shareAll,
  autoShareScope,
} from "@angular-architects/native-federation/config";

// Used only by the federated build (angular.json project "mfe-orders-federated").
export default withNativeFederation({
  name: "mfe-orders",

  exposes: {
    "./web-component": "./projects/mfe-orders/src/web-component.ts",
  },

  // Version-scoped sharing ("ng22" here), as in the Shared POC (poc-shared/).
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
