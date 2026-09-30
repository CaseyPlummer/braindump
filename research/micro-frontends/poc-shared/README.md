# POC: Shared host — Angular shared via Native Federation

A runnable proof-of-concept for the **Shared** host of the
[host-architecture recommendation](../recommendation.md): the **same web-component
boundary** as [`../poc-isolated/`](../poc-isolated/), but the Angular runtime is **shared via
Native Federation** when versions align and kept **private when they diverge**.
The page composes four MFEs: two on the host's Angular major, one a major behind
and one two majors behind. A fifth remote, three majors behind, is available as an
opt-in.

| Workspace | Angular | Federation packages                                                                                                                           |
| --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `./`      | 22.2.0  | `@angular-architects/native-federation` 22.2.1 → `@softarc/native-federation` 4.7.0, `@softarc/native-federation-orchestrator` 4.6.1          |
| `./ng21/` | 21.2.24 | `@angular-architects/native-federation-v4` 21.2.14 → `@softarc/native-federation` 4.7.0 (same v4 metadata format the host orchestrator reads) |
| `./ng20/` | 20.3.32 | `@angular-architects/native-federation-v4` 20.4.3 → `@softarc/native-federation` 4.7.0 (v4 metadata)                                          |
| `./ng19/` | 19.2.25 | `@angular-architects/native-federation` 19.0.23 → `@softarc/native-federation` 3.0.2 (v3 metadata; opt-in)                                    |

The v22 workspace and the `ng21`/`ng20` workspaces use `es-module-shims` 2.8.4;
`ng19` uses 1.10.1 (only the host's copy runs on the page). TypeScript is 6.0.3
(root), 5.9.3 (`ng21`, `ng20`) and 5.8.3 (`ng19`). The v22 CLI requires Node
`^22.22.3 || ^24.15.0 || >=26.0.0`.

## What it proves (verified in headless Chromium)

- **Share when aligned.** The host, `mfe-orders` and `mfe-profile` (all Angular
  22.2.0) download **one** `@angular/core` — the host's
  `_angular_core.<hash>.js`, 285.6 kB raw / 96.2 kB gzip. The aligned remotes add
  only their exposed module (2.0 kB and 1.4 kB raw) plus one shared copy of
  `@angular/elements` (5.2 kB raw), which the host itself does not use.
- **Private when diverged, per major.** `mfe-orders-ng21` (Angular 21.2.24) and
  `mfe-orders-ng20` (Angular 20.3.32) each run on their own Angular: distinct
  cores `mfe-orders-ng21/_angular_core.<hash>.js` (262.7 kB raw / 88.2 kB gzip) and
  `mfe-orders-ng20/_angular_core.<hash>.js` (258.5 kB raw / 86.8 kB gzip). The
  generated import map has one scope per remote; `./`, `/mfe-orders/` and
  `/mfe-profile/` map `@angular/core` to the host's copy, `/mfe-orders-ng21/` and
  `/mfe-orders-ng20/` to their own. The rendered elements report `ng-version`
  22.2.0 (host, `mfe-orders`, `mfe-profile`), 21.2.24 and 20.3.32.
- **Version-agnostic packages stay shared across majors.** `rxjs` 7.8.2 and
  `tslib` 2.8.1 are downloaded **once**, from the host, and used by all five apps,
  including the Angular 21 and 20 remotes.
- **Same typed DOM contract across versions.** The host binds `[customer]` and
  `(orderSelected)` identically on `<mfe-orders>`, `<mfe-orders-ng21>` and
  `<mfe-orders-ng20>`; typing in the host input re-renders all three, and clicking
  an order in any of them updates the host. No console errors or warnings.
- **Runtime composition via a manifest.** The host reads
  `federation.manifest.json`, then the `loadRemoteModule` returned by
  `initFederation` pulls each remote's exposed `./web-component` module, which
  registers its custom element.
- **Three majors behind works only from another origin.** An Angular 19 remote,
  built with the Native Federation v3 line, loads next to the other four when it is
  served from its own origin, and fails when it is served under the host's path.
  See [Angular 19 (Native Federation v3)](#angular-19-native-federation-v3).

## Loading remotes

`initFederation()` resolves to a federation instance (`NativeFederationResult`:
`loadRemoteModule`, `initRemoteEntry`, `as<T>()`, `adapters`, ...). The host hands
it to the Angular app and provides it through DI, instead of importing the
deprecated top-level `loadRemoteModule`, which resolves against a module-scoped
instance from the most recent `initFederation` call:

```ts
// main.ts
initFederation('federation.manifest.json', {
  feature: { useAutoExternalPooling: true },
  logLevel: 'debug',
})
  .then((nf) => import('./bootstrap').then((m) => m.bootstrap(nf)))
  .catch((err) => console.error(err));

// app.config.ts
export const NATIVE_FEDERATION = new InjectionToken<NativeFederationResult>('NATIVE_FEDERATION');
export const appConfig = (nf: NativeFederationResult): ApplicationConfig => ({
  providers: [provideBrowserGlobalErrorListeners(), { provide: NATIVE_FEDERATION, useValue: nf }],
});

// app.ts
private readonly nf = inject(NATIVE_FEDERATION);
const mod = await this.nf.loadRemoteModule<RemoteWebComponent>('mfe-orders', './web-component');
await mod.register();
```

The host also uses `nf.adapters.remoteInfoRepo.contains(name)` to skip the opt-in
Angular 19 remote when the manifest does not list it.

## Version-scoped sharing

Every app shares its dependencies from `package.json` and scopes **only the Angular
family** by its own `@angular/core` major:

```js
import {
  withNativeFederation,
  fromPackageJson,
  autoShareScope,
} from '@angular-architects/native-federation/config';

const ng = autoShareScope({ level: 'major' }); // "ng22" here, "ng21" in ng21/
const base = { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' };

export default withNativeFederation({
  name: 'mfe-orders',
  exposes: { './web-component': './projects/mfe-orders/src/app/web-component.ts' },
  shared: fromPackageJson(base)
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
      '@angular/core': { ...base, includeSecondaries: { keepAll: true }, shareScope: ng },
    })
    .get(),
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
  features: { denseChunking: true },
});
```

`autoShareScope()` reads the declared `@angular/core` range from the nearest
`package.json` (from the build's working directory) and emits `ng<major>` for
`level: 'major'` (`'minor'`, the default, would give `ng22.2`). `.patch()` tags every
other `@angular/*` dependency, and their secondary entry points, with that scope;
`@angular/core` keeps `includeSecondaries: { keepAll: true }`, so apps in a scope
need not import identical core entry points. Everything else (`rxjs`, `tslib`, ...)
carries no scope and is resolved in the default scope, where every app on the page
shares it.

The Angular 20 adapter line (`native-federation-v4` 20.4.x) predates
`fromPackageJson` and `autoShareScope` in its config entry point, so
`ng20/.../federation.config.mjs` builds the same configuration from core's
`fromPackageJson` (seeded with the adapter's `NG_SKIP_LIST`) and derives `"ng20"`
from its `package.json`. The emitted `remoteEntry.json` is identical in shape.

With pooling on, the orchestrator logs its verdict per share scope, e.g.
`[ng22][pool:@angular/common] 10 members across 3 remotes, incompatible={∅}`.
The resolved record (`globalThis.__NATIVE_FEDERATION__['shared-externals']`)
reads:

| Scope        | Package          | Resolution                                                  |
| ------------ | ---------------- | ----------------------------------------------------------- |
| `ng22`       | `@angular/core`  | 22.2.0 — `share` (host) ← host, `mfe-orders`, `mfe-profile` |
| `ng21`       | `@angular/core`  | 21.2.24 — `share` ← `mfe-orders-ng21`                       |
| `ng20`       | `@angular/core`  | 20.3.32 — `share` ← `mfe-orders-ng20`                       |
| `__GLOBAL__` | `rxjs` / `tslib` | 7.8.2 / 2.8.1 — `share` (host) ← all five apps              |

### Strictness and the unscoped alternative

| Configuration                                                         | Result                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scoped (as shipped) + `strict: { strictExternalCompatibility: true }` | No error, with all five remotes (Angular 19 from its own origin). Each Angular major lives in its own scope, and the default scope holds one version of each package.                                                                                                                                                                           |
| No `shareScope` anywhere + `strictExternalCompatibility: true`        | `initFederation` rejects and the host does not boot: `[mfe-orders-ng21][@angular/common@21.2.24] Is not compatible with requiredRange '~21.2.24' of shared @angular/common@22.2.0.` → `NFError: Could not determine shared externals in scope __GLOBAL__.`, followed by `Unable to resolve specifier '@angular/platform-browser'`.              |
| No `shareScope` anywhere, default (non-strict) mode                   | Works. Because every copy uses `strictVersion: true`, the resolver scopes the Angular 21 copies per remote, and pooling moves the whole family together: `'mfe-orders-ng21' is islanded: the resolver scoped its '@angular/common@21.2.24', so all 10 members it imports are scoped for it.` `rxjs` and `tslib` stay shared across both majors. |

`strictExternalCompatibility` is therefore a guard for a remote that lands in the
**wrong** scope, not a test of cross-scope divergence. The explicit share scope
makes the version partition a build-time decision that holds even for externals
declared with `strictVersion: false`, which the unscoped resolver would share
across majors with only a warning.

Scoping the whole app (a top-level `shareScope` instead of per-dependency scopes)
also partitions `rxjs` and `tslib`: each older-major remote then downloads its own
copies. Scoping only the Angular family saves 64.8 kB raw / 22.5 kB gzip per
older-major remote (the Angular 21 remote drops from 528.6 kB / 177.9 kB to
463.8 kB / 155.4 kB).

## Remotes more than one major behind

| Remote            | Angular | Federation line | Result                                                                                         |
| ----------------- | ------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `mfe-orders-ng21` | 21      | v4              | Works; own `ng21` scope.                                                                       |
| `mfe-orders-ng20` | 20      | v4              | Works; own `ng20` scope.                                                                       |
| `mfe-orders-ng19` | 19      | v3              | Works only from another origin; fails under the host's path. Opt-in, not in the default build. |

The v4 line (`@angular-architects/native-federation-v4`) supports Angular 20 and
21; from Angular 22 the adapter is `@angular-architects/native-federation` again.
Angular 19 and older are only on the v3 line.

### Angular 20

`ng20/` is a copy of `mfe-orders` on Angular 20.3.32 under the tag
`mfe-orders-ng20`, with the same contract and Angular-family-only share scope. It
is zoneless: Angular 20 still defaults to zone-based change detection, so its
`createApplication()` passes `provideZonelessChangeDetection()` (stable since
Angular 20); no page in this POC loads zone.js. Two differences from the newer
adapters:

- Its config uses core's `fromPackageJson` and a `package.json`-derived scope, as
  described above.
- Its build only compiles files listed in `tsconfig.federation.json`, so the
  exposed `src/app/web-component.ts` is included there explicitly.

### Angular 19 (Native Federation v3)

`ng19/` builds the same remote on Angular 19.2.25 with
`@angular-architects/native-federation` 19.0.23. The v3 build has no share scopes,
and its `remoteEntry.json` has no `$version`, `chunks`, `shareScope` or `bundle`
fields; shared chunks are listed as pseudo-externals in `shared`. The v4
orchestrator reads that format without extra configuration: each flat
`outFileName` entry is converted to the dense `entries` form on fetch
(`feature.convertFlatSharedInfo` additionally groups secondaries under their
package).

With no scope, the remote's Angular 19 externals land in the **default scope**.
Nothing else offers `@angular/core` there (the host's is in `ng22`), so Angular 19
is chosen and written to the import map's **top-level `imports`**, while `rxjs` and
`tslib` are shared with the host. Whether the remote then gets its own Angular
depends on where it is served:

- **Own origin (`npm run serve:ng19`, remote on `http://localhost:8139`)** —
  works. No import-map scope covers the remote's URLs, so its bare
  `@angular/core` resolves through the top-level entry to its own copy
  (`http://localhost:8139/_angular_core.<hash>.js`, 277.6 kB raw / 91.9 kB gzip).
  It renders with `ng-version` 19.2.25, passes the input/event contract, and logs
  no errors, also with `strictExternalCompatibility: true`.
- **Same origin under the host (`npm run serve:ng19-same-origin`, remote at
  `/mfe-orders-ng19/`)** — fails. The host's scope `./` covers every path on the
  origin, and the remote's own scope lists only its chunks, so its `@angular/core`
  resolves to the host's Angular 22. Registering the element fails with:
  `Failed to load mfe-orders-ng19 SyntaxError: The requested module 'blob:http://localhost:8138/…' does not provide an export named 'ComponentFactoryResolver'`.

Beyond the same-origin failure, a v3 remote carries structural risks: its Angular
becomes the page's default `@angular/core` for any unscoped code, and two v3
remotes on different Angular versions would compete in the same default scope.
Treat Angular 19 remotes as a migration bridge, served from their own origin, not
as a supported configuration.

Building on the v3 line also needed: `@angular-devkit/build-angular` (the v3
builder imports it), an explicit `outputPath` on the application target, a
CommonJS `federation.config.js`, skipping the
`@angular/platform-browser/animations` entry points (v3 shares every secondary
entry point and has no `ignoreUnusedDeps`), and Angular 19's developer-preview
`provideExperimentalZonelessChangeDetection()`. The v3 builder regenerates
`tsconfig.federation.json` from `tsconfig.app.json` on every build.

## Measured cost

Production builds, sizes in kB (1,000 bytes), gzip level 9 on the files the page
downloads. Each remote's row includes its `remoteEntry.json`; the host row includes
the manifest.

| What the page downloads                                                          | Raw        | Gzip     |
| -------------------------------------------------------------------------------- | ---------- | -------- |
| Host: shell, orchestrator, `es-module-shims`, shared Angular 22, `rxjs`, `tslib` | 678.8 kB   | 228.7 kB |
| Aligned remotes (`mfe-orders` + `mfe-profile`)                                   | 17.4 kB    | 5.1 kB   |
| Angular 21 remote (own Angular family + its code)                                | 463.8 kB   | 155.4 kB |
| Angular 20 remote (own Angular family + its code)                                | 449.8 kB   | 150.9 kB |
| **Whole page, four MFEs (default build)**                                        | 1,609.8 kB | 540.1 kB |
| Angular 19 remote (opt-in, own origin)                                           | 430.5 kB   | 142.3 kB |
| **Whole page, five MFEs**                                                        | 2,040.1 kB | 682.3 kB |

Each extra Angular major on the page costs **~430–465 kB raw / ~140–155 kB gzip**:
a full private Angular family (`core`, `common`, `common/http`,
`platform-browser`, `elements`) plus the remote's own code. `rxjs` and `tslib` are
not part of that cost.

Two costs to plan around:

- **Shared externals are not tree-shaken.** Each shared package is built whole,
  so the host's shared `@angular/core` alone (96.2 kB gzip) is larger than an
  entire isolated-runtime element (~36 kB gzip). The host plus the two aligned
  remotes is ~234 kB gzip here versus ~111 kB for the Isolated host in
  [`../poc-isolated/`](../poc-isolated/). Sharing pays off only once enough aligned
  MFEs share one page to amortise the larger fixed cost.
- **Every older major is a full Angular download.** A remote on a different major
  shares nothing Angular-related with the rest of the page, so a page that mixes
  several majors pays for each of them in full.

## Architecture

```
projects/
  host/            dynamic host — initFederation() → DI-provided loader → renders the elements
  mfe-orders/      remote (Angular 22) — exposes ./web-component, registers <mfe-orders>
  mfe-profile/     remote (Angular 22) — exposes ./web-component, registers <mfe-profile>
ng21/              separate Angular 21 workspace (own package.json and lockfile)
  projects/mfe-orders-ng21/   remote — registers <mfe-orders-ng21>
ng20/              separate Angular 20 workspace (own package.json and lockfile)
  projects/mfe-orders-ng20/   remote — registers <mfe-orders-ng20>
ng19/              separate Angular 19 workspace, Native Federation v3 (opt-in)
  projects/mfe-orders-ng19/   remote — registers <mfe-orders-ng19>
assemble.mjs       copies each built remote under dist/host/browser/<remote>/ (mirrors a CDN)
serve.mjs          static server for the assembled host (+ opt-in Angular 19 modes)
```

The older-major remotes are copies of `mfe-orders` with the same component
contract. Each registers under a **different tag** because the custom-element
registry is global to the page: two builds cannot both define `mfe-orders`. All
apps are zoneless and build their elements with `createApplication()` +
`createCustomElement()`.

## Run it

```bash
npm install          # also installs ng21/ and ng20/ via postinstall
npm run build        # build:mfes -> build:ng21 -> build:ng20 -> build:host -> assemble
npm run serve:dist   # http://localhost:8138
```

Opt-in Angular 19 remote (after `npm run build`):

```bash
npm run build:ng19               # installs and builds ng19/
npm run serve:ng19               # host on :8138, Angular 19 remote on its own origin :8139 (works)
npm run serve:ng19-same-origin   # Angular 19 remote under /mfe-orders-ng19/ (reproduces the failure)
```

Both modes add `mfe-orders-ng19` to the served manifest; the built host only loads
that remote when the manifest lists it.

For the standard NF dev workflow instead, each app has its own `ng serve` target
(host 4200, remotes 4201/4202, `ng21` 4203, `ng20` 4204, `ng19` 4205) with absolute
remote URLs in the manifest.

## Relationship to the other demos

- [`../isolation-demo/`](../isolation-demo/) — proves the boundary + multi-runtime
  isolation (static host).
- [`../poc-isolated/`](../poc-isolated/) — **Isolated**: realistic host, self-contained MFEs (each its
  own runtime), no federation.
- **this** — **Shared**: realistic host, runtime shared per Angular major via
  Native Federation, with remotes one and two majors behind running side by side.

Both hosts use the same boundary (custom elements, inputs down, DOM events up); they
differ in how the Angular runtime reaches each MFE. For when to choose which, see
[`../recommendation.md`](../recommendation.md).
