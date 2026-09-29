# Isolation demo: Angular MFE as a self-contained web component

A minimal, runnable illustration of the core idea behind the
[micro-frontends research](../README.md): an Angular micro-frontend packaged as a
**self-contained custom element** that carries its own runtime, plus a demo page
that runs **several independent runtimes side by side** to show version isolation.

> **Scope:** this is a focused spike that proves the **boundary and runtime
> isolation** only. Its "host" is intentionally a static HTML page with `<script>`
> tags — _not_ a realistic host. For a real Angular host with manifest-driven runtime
> loading and a typed DOM contract, see [`../poc-isolated/`](../poc-isolated/) (Isolated) and _Host
> architecture_ in [`../recommendation.md`](../recommendation.md).

> Built on **Angular 22.2** (zoneless by default, esbuild, TypeScript 6.0). The
> v22 CLI requires Node `^22.22.3 || ^24.15.0 || >=26.0.0`.

## What it demonstrates

1. **Packaging** — `src/main.ts` wraps a standalone component with
   `@angular/elements` `createCustomElement()` and registers it via
   `customElements.define()`. The host embeds it as plain HTML; it need not know
   the element is Angular, or which version.
2. **Self-containment** — each build bundles its own Angular runtime, so the same
   artifact drops into hosts on different Angular versions unchanged.
3. **Isolation** — `host/` mounts three independently-named copies on one page.
   Clicking one does not affect the others: three separate change-detection
   contexts, no cross-talk.

## Run it

```bash
npm install

# 1) Single element, dev server with live reload:
npm start            # http://localhost:4200

# 2) Multi-runtime demo (build + assemble three independent runtimes):
npm run demo         # produces host/index.html + host/mfe-{a,b,c}.js
npm run serve:host   # http://localhost:8137
```

`host/assemble.mjs` reuses one production build and rewrites the element name to
keep the demo tiny. In production each MFE is its own build, its own element name,
and its own deploy — `assemble.mjs` only simulates that on a single page.

## Measured (this exact build — Angular 22.2, production, zoneless, esbuild)

| Artifact                                                 | Raw      | Gzip (level 9) |
| -------------------------------------------------------- | -------- | -------------- |
| One functional element (framework + a trivial component) | 110.5 kB | **36.7 kB**    |
| Three independent runtimes on one page (combined)        | 331.3 kB | **110.0 kB**   |
| JS heap, three runtimes coexisting                       | ~5.8 MB  | —              |

Sizes are in kB (1 kB = 1,000 bytes), measured on the emitted `main.js` with Node's
`zlib` at level 9; the default level 6 is within 0.1 kB. Brotli brings the single
element to ~33.0 kB. The heap figure is Chromium's `performance.memory.usedJSHeapSize`
after interacting with all three elements — a coarse, bucketed reading, not a
precise per-runtime cost.

The ~37 kB gzip framework floor is the **per-MFE duplication cost** — what you pay
once per _distinct Angular version live on a page_. See
[`../performance.md`](../performance.md) for how this maps to web-performance
budgets and the "share-when-aligned" model that keeps steady-state cost to a
single shared runtime.

## Files

| Path                    | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `src/main.ts`           | Component + custom-element registration (the whole concept) |
| `src/app/app.config.ts` | App-wide providers (zoneless by default in v21+)            |
| `src/index.html`        | Single-element dev page for `npm start`                     |
| `host/assemble.mjs`     | Builds the N-independent-runtime demo page                  |
| `host/serve.mjs`        | Dependency-free static server (ESM needs HTTP, not file://) |

Generated demo files (`host/index.html`, `host/mfe-*.js`) and build output are
git-ignored; regenerate with `npm run demo`.
