import { initFederation } from '@angular-architects/native-federation';

// Standalone entry for running this remote on its own. The host does not use
// it; it loads the exposed ./web-component module instead.
initFederation({ 'mfe-orders-ng19': './remoteEntry.json' })
  .catch((err) => console.error(err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error(err));
