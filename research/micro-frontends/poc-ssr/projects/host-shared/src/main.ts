import { initFederation } from "@angular-architects/native-federation";

// Browser entry: resolve shared externals and remotes first, then bootstrap (and
// hydrate) the host on the shared Angular runtime.
initFederation("federation.manifest.json", {
  feature: { useAutoExternalPooling: true },
})
  .catch((err) => console.error(err))
  .then(() => import("./bootstrap"))
  .catch((err) => console.error(err));
