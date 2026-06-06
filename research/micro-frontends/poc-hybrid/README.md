# POC: hybrid / share-when-aligned (Flavor 2)

A runnable proof-of-concept for **Flavor 2** of the
[host-architecture recommendation](../recommendation.md): the **same web-component
boundary** as [`../poc/`](../poc/), but the Angular runtime is **shared via
Native Federation** when versions align — so the MFE bundles carry no Angular of
their own. Built with **Angular 22** + `@angular-architects/native-federation@22`.

## What it proves (verified in a headless browser)

- **One shared Angular runtime.** `@angular/core` is downloaded **once** (from the
  host), not per MFE. The remotes' bundles are ~50 KB (their own code) instead of
  the ~107 KB self-contained build in Flavor 1 — Angular isn't in them.
- **Same web-component boundary + typed DOM contract.** The host renders
  `<mfe-orders>` / `<mfe-profile>` with `CUSTOM_ELEMENTS_SCHEMA`; host→MFE inputs
  (`customer`) and MFE→host events (`orderSelected`) work exactly as in Flavor 1.
- **Runtime composition via a manifest.** The host reads
  `federation.manifest.json`, then `loadRemoteModule` pulls each remote's exposed
  `./web-component` module, which registers its element on the shared runtime.

This is the **non-breaking upgrade** from Flavor 1: the MFEs are still custom
elements; only the runtime is shared. (When a remote's Angular major diverges from
the host's, Native Federation falls back to loading that remote's own copy — the
"private when they diverge" half. That fallback is config-level and not exercised
in this single-version demo.)

## Architecture

```
projects/
  host/         dynamic-host — initFederation() + loadRemoteModule() + renders the elements
  mfe-orders/   remote — exposes ./web-component (registers <mfe-orders>), shares Angular
  mfe-profile/  remote — exposes ./web-component (registers <mfe-profile>), shares Angular
assemble.mjs    copies each built remote under dist/host/browser/<remote>/ (mirrors a CDN)
serve.mjs       static server for the assembled host
```

Native Federation (via `ng add`) switched each app to the esbuild **application
builder** and added `federation.config.mjs` (with `shareAll({ singleton: true,
strictVersion: true })`), `bootstrap.ts`, and the `es-module-shims` import-map
polyfill. See each project's `federation.config.mjs`.

## Run it

```bash
npm install
npm run build        # build:mfes -> build:host -> assemble
npm run serve:dist   # http://localhost:8138
```

For the standard NF dev workflow instead, each app has its own `ng serve` target
(host 4200, remotes 4201/4202) with absolute remote URLs in the manifest.

## How sharing works here

Each app builds its `node_modules` deps as **separate browser-ESM bundles**
(`browser-separate`) and emits an **import map**. `initFederation()` merges the
host + remotes' import maps and picks **one** version per shared singleton
(`@angular/core`, `@angular/common`, `rxjs`, …). So when everything is on Angular
22, the page loads a single Angular — confirmed by the network trace (one
`_angular_core.*.js`).

## Relationship to the other demos

- [`../isolation-demo/`](../isolation-demo/) — proves the boundary + multi-runtime
  isolation (static host).
- [`../poc/`](../poc/) — **Flavor 1**: realistic host, self-contained MFEs (each its
  own runtime), no federation.
- **this** — **Flavor 2**: realistic host, shared runtime via Native Federation.

Ship Flavor 1 first; adopt Flavor 2 when a busy page needs to stop duplicating the
runtime. The MFE source is identical between them — only the host wiring and build
differ.
