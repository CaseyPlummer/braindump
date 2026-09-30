import {
  withNativeFederation,
  fromPackageJson,
  autoShareScope,
} from '@angular-architects/native-federation/config';

// Share scope derived from this workspace's @angular/core major ("ng22").
// Only the Angular family is scoped: an app on another Angular major gets its own
// Angular copy instead of a broken singleton, while version-agnostic packages
// (rxjs, tslib, ...) stay in the default scope and are shared across majors.
const ng = autoShareScope({ level: 'major' });
const base = { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' };

export default withNativeFederation({
  name: 'mfe-orders',

  exposes: {
    './web-component': './projects/mfe-orders/src/app/web-component.ts',
  },

  shared: fromPackageJson(base)
    // Every other @angular/* dependency in package.json.
    .patch(
      [
        '@angular/common',
        '@angular/compiler',
        '@angular/elements',
        '@angular/forms',
        '@angular/platform-browser',
        '@angular/router',
      ],
      { shareScope: ng },
    )
    .override({
      // includeSecondaries is an opt-out of ignoreUnusedDeps, so all of
      // @angular/core is shared and apps in a scope need not import identical
      // core entry points.
      '@angular/core': { ...base, includeSecondaries: { keepAll: true }, shareScope: ng },
    })
    .get(),

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: {
    // Groups chunks in remoteEntry.json for a smaller metadata file.
    denseChunking: true,
  },
});
