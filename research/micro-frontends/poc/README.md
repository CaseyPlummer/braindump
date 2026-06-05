# POC: realistic host loading self-contained MFEs (Flavor 1)

A runnable proof-of-concept for the **recommended starting architecture**: a real
**Angular host** that discovers and loads **self-contained web-component MFEs at
runtime from a manifest** — pure isolation, **no federation, no shared runtime**
(["Flavor 1" in the host-architecture section](../recommendation.md)).

Where [`../isolation-demo/`](../isolation-demo/) only proves the boundary with a static
HTML page, this shows the **realistic host**: manifest-driven loading, a loader service,
and a typed DOM contract (inputs down, events up).

## What it demonstrates

1. **Manifest-driven runtime loading.** The host fetches `mfes/manifest.json`
   (`{ tag, url }[]`) and injects each MFE's ES-module bundle on the fly via
   `MfeLoaderService` — no build-time link between host and MFEs. In production those
   URLs point at a **CDN**; here they're served from the host's `public/`.
2. **Standard custom-element rendering.** The host template uses `<mfe-orders>` /
   `<mfe-profile>` with `CUSTOM_ELEMENTS_SCHEMA`; nothing tells it they're Angular.
3. **Typed DOM contract both directions.**
   - **host → MFE:** `[customer]="customer()"` flows into `mfe-orders`' `@Input`.
   - **MFE → host:** `mfe-orders` emits an `@Output` (`orderSelected`) that surfaces as
     a DOM `CustomEvent`; the host listens with `(orderSelected)=...` and shows the value.
4. **Several MFEs composing on one page**, each a separate build with its own runtime.

## Architecture

```
projects/
  host/         Angular app  — shell + MfeLoaderService + manifest consumer
  mfe-orders/   Angular app  — built as <mfe-orders> custom element (own runtime)
  mfe-profile/  Angular app  — built as <mfe-profile> custom element (own runtime)
assemble.mjs    copies each MFE's dist bundle + writes manifest.json into host/public/mfes/
serve.mjs       static server for the built host
```

Each MFE is an independent build (separate `ng build` target) — a single workspace here
for convenience; in production each is its own repo/pipeline (see the polyrepo guidance
in [`../recommendation.md`](../recommendation.md)).

## Run it

```bash
npm install

# Build both MFEs, assemble the manifest, build the host, serve it:
npm run build
npm run serve:dist     # http://localhost:8137

# …or develop the host with live reload (MFEs are prebuilt into public/mfes):
npm run build:mfes && npm run assemble && npm start   # ng serve host
```

`npm run build` = `build:mfes` → `assemble` (copy bundles + write
`projects/host/public/mfes/manifest.json`) → `ng build host`.

## How a new MFE joins

1. Add a project that registers a `customElements.define('mfe-x', …)` element (copy
   `mfe-orders`).
2. Add its name to `remotes` in `assemble.mjs` (in production: publish its bundle to the
   CDN and add a manifest entry).
3. The host renders it wherever it places `<mfe-x>` — no host redeploy needed once the
   manifest is fetched at runtime.

## Not shown here (deliberately)

- **Runtime sharing** of the Angular runtime across MFEs — that's **Flavor 2**
  (share-when-aligned via Native Federation), a non-breaking add-on when a busy page
  needs it. This POC is the simpler Flavor 1 you ship first.
- A production **registry/CDN**, auth/session, and cross-MFE shared services.
