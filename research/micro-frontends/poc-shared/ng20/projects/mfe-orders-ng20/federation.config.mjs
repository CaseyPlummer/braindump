import { readFileSync } from 'node:fs';
import { fromPackageJson } from '@softarc/native-federation/config';
import {
  withNativeFederation,
  NG_SKIP_LIST,
} from '@angular-architects/native-federation-v4/config';

// The Angular 20 line of the adapter (20.4.x) predates `fromPackageJson` and
// `autoShareScope` in its config entry point, so this config builds the same
// thing from their parts: core's `fromPackageJson` seeded with the Angular skip
// list (what the newer adapters' `fromPackageJson` does), and the share scope
// derived from this workspace's @angular/core major ("ng20"), which is what
// `autoShareScope({ level: 'major' })` returns on the newer adapters.
const { dependencies } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)));
const ng = `ng${dependencies['@angular/core'].match(/\d+/)[0]}`;
const base = { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' };

export default withNativeFederation({
  name: 'mfe-orders-ng20',

  exposes: {
    './web-component': './projects/mfe-orders-ng20/src/app/web-component.ts',
  },

  // Only the Angular family is scoped; rxjs, tslib, ... stay in the default
  // scope and are shared with the host and the other remotes.
  shared: fromPackageJson(base)
    .skip(NG_SKIP_LIST)
    // Every other @angular/* dependency in package.json.
    .patch(
      ['@angular/common', '@angular/compiler', '@angular/elements', '@angular/platform-browser'],
      { shareScope: ng },
    )
    .override({
      '@angular/core': { ...base, includeSecondaries: { keepAll: true }, shareScope: ng },
    })
    .get(),

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: {
    denseChunking: true,
  },
});
