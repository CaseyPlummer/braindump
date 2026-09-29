import { initFederation } from "@angular-architects/native-federation-v4";

// Standalone entry of the federated build (index.html dev page). Hosts do not use
// it; they load the exposed ./web-component module instead.
initFederation({ "mfe-orders-ng21": "./remoteEntry.json" })
  .then(() => import("./web-component"))
  .then((m) => m.register())
  .catch((err) => console.error(err));
