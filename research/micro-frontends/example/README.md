# Barebones Angular MFE as a self-contained web component

A minimal, runnable illustration of the core idea behind the
[micro-frontends research](../README.md): an Angular micro-frontend packaged as a
**self-contained custom element** that carries its own runtime, plus a demo page
that runs **several independent runtimes side by side** to show version isolation.

> Built on **Angular 22** (zoneless by default, esbuild, TypeScript 6). Requires
> Node ≥ 24.15 for the v22 CLI.

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

## Measured (this exact build — Angular 22, production, zoneless, esbuild)

| Artifact                                                 | Raw     | Gzip          |
| -------------------------------------------------------- | ------- | ------------- |
| One functional element (framework + a trivial component) | ~106 KB | **~35.2 KB**  |
| Three independent runtimes on one page (combined)        | ~318 KB | **~105.7 KB** |
| JS heap, three runtimes coexisting                       | ~3.8 MB | —             |

The ~35 KB gzip framework floor is the **per-MFE duplication cost** — what you pay
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
