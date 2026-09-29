# POC: Shared host — Angular shared via Native Federation

A runnable proof-of-concept for the **Shared** host of the
[host-architecture recommendation](../recommendation.md): the **same web-component
boundary** as [`../poc-isolated/`](../poc-isolated/), but the Angular runtime is **shared via
Native Federation** when versions align and kept **private when they diverge**.
The page composes three MFEs: two on the host's Angular major and one a major
behind.

| Workspace | Angular | Federation packages                                                                                                                           |
| --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `./`      | 22.2.0  | `@angular-architects/native-federation` 22.2.1 → `@softarc/native-federation` 4.7.0, `@softarc/native-federation-orchestrator` 4.6.1          |
| `./ng21/` | 21.2.24 | `@angular-architects/native-federation-v4` 21.2.14 → `@softarc/native-federation` 4.7.0 (same v4 metadata format the host orchestrator reads) |

Both workspaces use `es-module-shims` 2.8.4. The root workspace uses TypeScript
6.0.3; the Angular 21 workspace uses TypeScript 5.9.3. The v22 CLI requires Node
`^22.22.3 || ^24.15.0 || >=26.0.0`.

## What it proves (verified in headless Chromium)

- **Share when aligned.** The host, `mfe-orders` and `mfe-profile` (all Angular
  22.2.0) download **one** `@angular/core` — the host's
  `_angular_core.<hash>.js`, 285.6 kB raw / 96.2 kB gzip. The aligned remotes add
  only their exposed module (2.0 kB and 1.4 kB raw) plus one shared copy of
  `@angular/elements` (5.2 kB raw), which the host itself does not use.
- **Private when diverged.** `mfe-orders-ng21` (Angular 21.2.24) runs on its own
  Angular: a second, distinct core `mfe-orders-ng21/_angular_core.<hash>.js`
  (262.7 kB raw / 88.2 kB gzip). The generated import map carries a
  `scopes["/mfe-orders-ng21/"]` entry that maps `@angular/core` (and the rest of
  its Angular family) to the remote's own files, while `./`, `/mfe-orders/` and
  `/mfe-profile/` all map to the host's copy. The rendered elements report
  `ng-version` 22.2.0 (host, `mfe-orders`, `mfe-profile`) and 21.2.24
  (`mfe-orders-ng21`).
- **Same typed DOM contract across versions.** The host binds `[customer]` and
  `(orderSelected)` identically on `<mfe-orders>` and `<mfe-orders-ng21>`; typing
  in the host input re-renders both, and clicking an order in either updates the
  host. No console errors or warnings.
- **Runtime composition via a manifest.** The host reads
  `federation.manifest.json`, then `loadRemoteModule` pulls each remote's exposed
  `./web-component` module, which registers its custom element.

## Version-scoped sharing

Every app's `federation.config.mjs` sets a share scope derived from its own
`@angular/core` version:

```js
import {
  withNativeFederation,
  shareAll,
  autoShareScope,
} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  shareScope: autoShareScope({ level: 'major' }), // "ng22" here, "ng21" in ng21/
  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
      build: 'package',
    }),
  },
});
```

`autoShareScope()` reads the declared `@angular/core` range from the nearest
`package.json` (from the build's working directory) and emits `ng<major>` for
`level: 'major'` (`'minor'`, the default, would give `ng22.2`). Every shared
external in `remoteEntry.json` is tagged with that scope, and the orchestrator
resolves each scope in isolation, so an Angular 21 copy is never offered to, or
chosen for, an Angular 22 app.

The host also opts into dependency pooling and debug logging in `initFederation`:

```ts
initFederation('federation.manifest.json', {
  feature: { useAutoExternalPooling: true }, // resolve each npm scope (@angular/*) as one family
  logLevel: 'debug',
});
```

With pooling on, the orchestrator logs its verdict per share scope, e.g.
`[ng22][pool:@angular/common] 10 members across 3 remotes, incompatible={∅}`.
The resolved record (`globalThis.__NATIVE_FEDERATION__['shared-externals']`)
reads:

| Scope  | `@angular/core`                                             | `rxjs` / `tslib`                            |
| ------ | ----------------------------------------------------------- | ------------------------------------------- |
| `ng22` | 22.2.0 — `share` (host) ← host, `mfe-orders`, `mfe-profile` | 7.8.2 / 2.8.1 — `share` (host) ← all three  |
| `ng21` | 21.2.24 — `share` ← `mfe-orders-ng21`                       | 7.8.2 / 2.8.1 — `share` ← `mfe-orders-ng21` |

### Strictness and the unscoped alternative

| Configuration                                                         | Result                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scoped (as shipped) + `strict: { strictExternalCompatibility: true }` | No error. The two majors live in different scopes, so no incompatible pair is ever compared.                                                                                                                                                                                                                                                    |
| No `shareScope` anywhere + `strictExternalCompatibility: true`        | `initFederation` rejects and the host does not boot: `[mfe-orders-ng21][@angular/common@21.2.24] Is not compatible with requiredRange '~21.2.24' of shared @angular/common@22.2.0.` → `NFError: Could not determine shared externals in scope __GLOBAL__.`, followed by `Unable to resolve specifier '@angular/platform-browser'`.              |
| No `shareScope` anywhere, default (non-strict) mode                   | Works. Because every copy uses `strictVersion: true`, the resolver scopes the Angular 21 copies per remote, and pooling moves the whole family together: `'mfe-orders-ng21' is islanded: the resolver scoped its '@angular/common@21.2.24', so all 10 members it imports are scoped for it.` `rxjs` and `tslib` stay shared across both majors. |

`strictExternalCompatibility` is therefore a guard for a remote that lands in the
**wrong** scope, not a test of cross-scope divergence. The explicit share scope
makes the version partition a build-time decision that holds even for externals
declared with `strictVersion: false`, which the unscoped resolver would share
across majors with only a warning.

## Measured cost

Production builds, sizes in kB (1,000 bytes), gzip level 9 on the emitted files.

| What the page downloads                                         | Raw        | Gzip     |
| --------------------------------------------------------------- | ---------- | -------- |
| Host: shell, orchestrator, `es-module-shims`, shared Angular 22 | 673.1 kB   | 227.5 kB |
| Aligned remotes (`mfe-orders` + `mfe-profile`)                  | 8.6 kB     | 3.6 kB   |
| Angular 21 remote (own Angular family + its code)               | 524.1 kB   | 177.2 kB |
| Whole page, three MFEs                                          | 1,205.7 kB | 408.3 kB |

Two costs to plan around:

- **Shared externals are not tree-shaken.** Each shared package is built whole,
  so the host's shared `@angular/core` alone (96.2 kB gzip) is larger than an
  entire isolated-runtime element (~36 kB gzip). The same three-app page
  without the Angular 21 remote is ~231 kB gzip here versus ~111 kB for the Isolated host
  in [`../poc-isolated/`](../poc-isolated/). Sharing pays off only once enough aligned MFEs share
  one page to amortise the larger fixed cost.
- **A whole-app share scope also partitions version-agnostic packages.** `rxjs`
  and `tslib` are the same versions in both majors but are downloaded twice
  (25.6 kB raw / 9.7 kB gzip extra), because they carry the `ng21` scope too. A
  per-dependency `shareScope` on the Angular packages only would keep them shared.

## Architecture

```
projects/
  host/            dynamic host — initFederation() + loadRemoteModule() + renders the elements
  mfe-orders/      remote (Angular 22) — exposes ./web-component, registers <mfe-orders>
  mfe-profile/     remote (Angular 22) — exposes ./web-component, registers <mfe-profile>
ng21/              separate Angular 21 workspace (own package.json and lockfile)
  projects/mfe-orders-ng21/
                   remote (Angular 21) — exposes ./web-component, registers <mfe-orders-ng21>
assemble.mjs       copies each built remote under dist/host/browser/<remote>/ (mirrors a CDN)
serve.mjs          static server for the assembled host
```

The Angular 21 remote is a copy of `mfe-orders` with the same component contract.
It registers under a **different tag** because the custom-element registry is
global to the page: two builds cannot both define `mfe-orders`. It is zoneless,
like the other apps, and builds its element with `createApplication()` +
`createCustomElement()`.

## Run it

```bash
npm install          # also installs ng21/ via postinstall
npm run build        # build:mfes -> build:ng21 -> build:host -> assemble
npm run serve:dist   # http://localhost:8138
```

For the standard NF dev workflow instead, each app has its own `ng serve` target
(host 4200, remotes 4201/4202, `ng21` remote 4203) with absolute remote URLs in
the manifest.

## Relationship to the other demos

- [`../isolation-demo/`](../isolation-demo/) — proves the boundary + multi-runtime
  isolation (static host).
- [`../poc-isolated/`](../poc-isolated/) — **Isolated**: realistic host, self-contained MFEs (each its
  own runtime), no federation.
- **this** — **Shared**: realistic host, runtime shared per Angular major via
  Native Federation, with a remote on the previous major running side by side.

The MFE source is identical between the two hosts — only the host wiring and build
differ. For when to choose which, see [`../recommendation.md`](../recommendation.md).