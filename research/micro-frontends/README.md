# Micro-frontends with Angular and web components

Grounded findings on modern micro-frontend (MFE) strategy for Angular, with a
focus on the case that drives most real-world decisions: a **reusable feature
embedded across multiple host applications that may sit on different framework
versions**, where teams ship on independent schedules.

Findings are current as of **mid-2026** (Angular 22 released; the demo builds on it).
This is a fast-moving area; see [`sources.md`](./sources.md) for what each claim is
grounded in.

## The one decision that drives everything

MFE tooling choice is downstream of a single question:

> **Can every host that embeds a given MFE be held to a compatible framework
> version, or must the same MFE run inside hosts on different versions?**

- **Versions can be aligned** → shared-singleton federation (one runtime per page)
  wins: smaller bundles, richer integration, SSR is reachable.
- **Versions cannot be aligned** (the "reusable ingredient" case) → a
  **self-contained web-component boundary** is the only model that lets one MFE
  build run, unchanged, inside hosts on different versions.

Everything else — bundler, repo layout, delivery model — is secondary to this.

## Contents

| Doc                                              | What's in it                                                                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`glossary.md`](./glossary.md)                   | Key terms: composition models, federation flavors, web components / Angular Elements, islands, isomorphic data fetching, "Hydra of Lerna", host/remote |
| [`comparison-matrix.md`](./comparison-matrix.md) | The package/approach grid — criteria scored across the candidate technologies, with gaps                                                               |
| [`performance.md`](./performance.md)             | Measured bundle/runtime cost, web-performance budgets, and the version-spread cost model                                                               |
| [`recommendation.md`](./recommendation.md)       | A recommendation for the version-independence scenario, with the decision gate and trade-offs named                                                    |
| [`isolation-demo/`](./isolation-demo/)           | A runnable barebones Angular MFE-as-web-component + a multi-runtime isolation proof (focused spike, not a full host)                                   |
| [`sources.md`](./sources.md)                     | Consolidated, dated sources                                                                                                                            |

> **Planned:** a `poc/` reference implementation — a realistic Angular host that
> loads MFEs via a manifest with **share-when-aligned** runtime sharing (Native
> Federation as the import-map/loader layer), where `isolation-demo/` only proves
> the boundary. See _Host architecture_ in [`recommendation.md`](./recommendation.md).

## Scope notes

- **Angular-to-Angular**, possibly across versions. Multi-_framework_ (polyglot)
  interop is explicitly out of scope, which removes a whole class of complexity.
- **single-spa** is treated as legacy and not recommended for new work
  (maintenance status; superseded by federation and native web-component
  approaches). It appears in the matrix only to document why it is excluded.
- **OpenComponents** (a registry-based framework with its own component model) is
  evaluated in [`comparison-matrix.md`](./comparison-matrix.md) and not recommended
  here — its strengths (polyglot, Node-less edge SSR) are orthogonal to an
  Angular-only, web-component-boundary strategy. Its versioned-registry idea is worth
  borrowing, though.
