# Micro-frontends with Angular and web components

Grounded findings on modern micro-frontend (MFE) strategy for Angular, with a
focus on the case that drives most real-world decisions: a **reusable feature
embedded across multiple host applications that may sit on different framework
versions**, where teams ship on independent schedules.

**Last reviewed: 2026-09-29** (Angular 22.2, Native Federation 22.2 / v4 runtime).
This is a fast-moving area; see [`sources.md`](./sources.md) for what each claim is
grounded in.

## The one decision that drives everything

MFE tooling choice is downstream of a single question:

> **Can every host that embeds a given MFE be held to a compatible framework
> version, or must the same MFE run inside hosts on different versions?**

- **Versions can be aligned** → shared-singleton federation (one runtime per page)
  wins: smaller bundles, richer integration, SSR is reachable.
- **Versions cannot be aligned** (the "reusable ingredient" case) → a
  **web-component boundary** lets one MFE build run, unchanged, inside hosts on
  different versions, because each MFE boots itself. The recommended default gives
  each MFE its own Angular (the **Isolated** runtime) and handles cross-cutting
  concerns through a small, framework-agnostic platform contract; sharing Angular per
  major via Native Federation (the **Shared** runtime) is the tested alternative.

Everything else — bundler, repo layout, delivery model — is secondary to this.

## Contents

| Doc                                              | What's in it                                                                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`glossary.md`](./glossary.md)                   | Key terms: composition models, federation flavors, web components / Angular Elements, islands, isomorphic data fetching, "Hydra of Lerna", host/remote |
| [`comparison-matrix.md`](./comparison-matrix.md) | The package/approach grid — criteria scored across the candidate technologies, with gaps                                                               |
| [`cross-cutting-concerns.md`](./cross-cutting-concerns.md) | Checklist of app-wide concerns (state, auth, routing, theming, resilience, …) and how each is handled with and without Native Federation |
| [`performance.md`](./performance.md)             | Measured bundle/runtime cost, web-performance budgets, and the version-spread cost model                                                               |
| [`recommendation.md`](./recommendation.md) | The decision (Isolated runtime by default), a decision matrix vs the Shared runtime with pros/cons, long-term justification, revisit triggers, SSR and delivery guidance |
| [`isolation-demo/`](./isolation-demo/)           | A runnable barebones Angular MFE-as-web-component + a multi-runtime isolation proof (focused spike, not a full host)                                   |
| [`poc-isolated/`](./poc-isolated/)                                 | A runnable **Isolated** reference: manifest-driven loading with fallback/SRI, a host services library (context, token, event bus), URL-sync routing, and Angular 21 + 22 MFEs on one page |
| [`poc-shared/`](./poc-shared/)                   | A runnable **Shared** reference: same boundary, Angular **shared per major via Native Federation**, plus an MFE a major behind on its own runtime     |
| [`poc-ssr/`](./poc-ssr/)                         | A runnable **fragment SSR** reference: both hosts server-render MFE fragments (incl. one a major behind) and hand over to the client without hydration |
| [`sources.md`](./sources.md)                     | Consolidated, dated sources                                                                                                                            |

> **Two host styles, one boundary:** `poc-isolated/` = **Isolated** runtime (each MFE
> bundles its own Angular; the recommended default) and `poc-shared/` = **Shared**
> runtime (Angular shared per major via Native Federation; the tested alternative).
> An MFE is written the same way for both; only its build and the host wiring differ. See
> [`recommendation.md`](./recommendation.md).

## Scope notes

- **Angular-to-Angular**, possibly across versions. Multi-_framework_ (polyglot)
  interop is explicitly out of scope, which removes a whole class of complexity.
- **single-spa** is treated as legacy and not recommended for new work
  (effectively dormant; superseded by federation and native web-component
  approaches). It appears in the matrix only to document why it is excluded.
- **OpenComponents** (a registry-based framework with its own component model) is
  evaluated in [`comparison-matrix.md`](./comparison-matrix.md) and not recommended
  here — its strengths (polyglot, Node-less edge SSR) are orthogonal to an
  Angular-only, web-component-boundary strategy. Its versioned-registry idea is worth
  borrowing, though.
