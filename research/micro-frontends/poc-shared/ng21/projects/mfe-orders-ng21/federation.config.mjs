import {
  withNativeFederation,
  shareAll,
  autoShareScope,
} from '@angular-architects/native-federation-v4/config';

export default withNativeFederation({
  name: 'mfe-orders-ng21',

  exposes: {
    './web-component': './projects/mfe-orders-ng21/src/app/web-component.ts',
  },

  // Resolves to "ng21" from this workspace's @angular/core. The host and the
  // aligned remotes resolve to "ng22", so this remote's Angular is never offered
  // to (or taken from) them: it gets its own copy through an import-map scope.
  shareScope: autoShareScope({ level: 'major' }),

  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
        },
      },
    ),
  },

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: {
    denseChunking: true,
  },
});
