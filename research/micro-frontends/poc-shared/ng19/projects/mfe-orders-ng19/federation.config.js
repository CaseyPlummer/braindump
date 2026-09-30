const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

// Angular 19 is only supported by the Native Federation v3 line, which has no share
// scopes: every shared external lands in the default scope, and the remoteEntry.json
// uses the flat v3 shared-info format.
module.exports = withNativeFederation({
  name: 'mfe-orders-ng19',

  exposes: {
    './web-component': './projects/mfe-orders-ng19/src/app/web-component.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  // v3 has no ignoreUnusedDeps: every secondary entry point is shared, so the
  // animations entry points (which need @angular/animations) are skipped.
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    '@angular/platform-browser/animations',
    '@angular/platform-browser/animations/async',
  ],
});
