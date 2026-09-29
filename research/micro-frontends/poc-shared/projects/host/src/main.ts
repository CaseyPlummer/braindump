import { initFederation } from '@angular-architects/native-federation';

initFederation('federation.manifest.json', {
  // Resolves each npm scope (@angular/*) as one family inside its share scope,
  // so no app ends up mixing Angular packages from different builds.
  feature: { useAutoExternalPooling: true },
  // 'debug' prints the orchestrator's per-external share/scope decisions to the
  // console; use 'warn' (the default) in production.
  logLevel: 'debug',
})
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
