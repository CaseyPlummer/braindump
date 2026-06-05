# Glossary

Terms that recur across the micro-frontend literature, defined for this context.

## Roles & composition

- **Host / shell / container** — the app that loads and composes MFEs into a page.
  The _consumer_. In federation terms, the side that _consumes_.
- **Remote / MFE / micro-app** — an independently-built unit loaded into a host.
  The _producer_. The side that _exposes_. One app can be both.
- **Composition model** — where the pieces are stitched together:
  - **Build-time** — MFEs consumed as npm packages. Simple, but couples deploys
    (a change means rebuilding/redeploying the host). Usually disqualifies "MFE".
  - **Run-time (client-side)** — host loads remotes live in the browser
    (federation, web components). The mainstream choice; enables independent deploys.
  - **Server-side / edge** — composition happens during SSR or at the edge. Best
    first paint, most infrastructure.

## Federation

- **Module Federation** — Webpack 5 mechanism for sharing code and loading remote
  modules at runtime. The original de-facto standard for client-side MFE.
- **Module Federation 2.0** — bundler-agnostic successor (works with webpack,
  **Rspack**, Vite). Adds a first-class **Node runtime** (so remotes can render
  server-side), **type sharing**, and isomorphic data fetching. Supports polyglot
  and multi-version setups. Went stable in 2026.
- **Native Federation** — a framework- and bundler-agnostic implementation of the
  same ideas built on **browser-native ES modules + import maps**, with
  first-class Angular CLI / esbuild integration. No webpack. Created by the Angular
  Architects (Manfred Steyer) team.
- **Shared singleton** — a dependency (e.g. `@angular/core`) configured so exactly
  one instance is loaded and shared by host + all remotes on a page. Efficient, but
  forces those parties onto a **compatible version** (for Angular, effectively the
  same major). `strictVersion` throws on mismatch; relaxed config falls back to a
  second copy.

## Web components

- **Custom Element / Web Component** — a browser-native, framework-agnostic
  component (`customElements.define()`). A stable DOM contract: attributes/
  properties in, DOM events out.
- **Angular Elements** (`@angular/elements`) — packages an Angular component as a
  custom element via `createCustomElement()`. The element bundles its own Angular
  runtime, making it **self-contained** and version-independent of the host.
- **Self-contained MFE** — an MFE that carries its own framework runtime. The same
  build runs in hosts on different versions, at the cost of duplicating the runtime
  when versions diverge (see [`performance.md`](./performance.md)).

## Versioning & interop

- **Multi-version** — multiple versions of the _same_ framework coexisting on a
  page. The axis that matters for the Angular-only "reusable ingredient" case.
- **Polyglot / multi-framework** — multiple _different_ frameworks coexisting
  (Angular + React + Vue). Out of scope for an Angular-only strategy.
- **Type sharing** — distributing a remote's TypeScript `.d.ts` types to consumers
  so the host gets autocomplete and compile-time checks across the MFE boundary
  (otherwise the boundary is untyped `any`). An MF 2.0 feature.
- **Import maps** — a browser standard mapping bare module specifiers to URLs.
  Native Federation uses them to wire shared dependencies without a bundler runtime.

## Rendering & performance

- **SSR (server-side rendering)** — render HTML on the server for fast first paint
  and SEO. Historically hard with MFE; now feasible on the shared-singleton path
  (Native Federation since Angular 18; MF 2.0 Node runtime). Hard-to-impractical
  with multiple self-contained runtimes.
- **Islands architecture / incremental hydration** — render mostly-static HTML and
  hydrate only the interactive regions ("islands"), independently and lazily.
  Angular expresses this via `@defer` with `hydrate` triggers. Each embedded MFE is
  naturally an island.
- **Isomorphic data fetching** — one data-fetching code path that runs the same on
  server and client with a shared cache, so SSR serializes fetched data and the
  client hydrates without re-fetching.
- **"Hydra of Lerna"** — nickname (associated with Luca Mezzalira) for the
  anti-pattern of running many frameworks/versions on one page: like the
  many-headed Hydra, the duplicated runtimes multiply as teams independently add
  their own. The danger is _uncontrolled_ duplication (frameworks **and** shared
  libs), which a deliberate shared-dependency policy tames.

## Tooling

- **esbuild** — Go-based bundler underpinning Angular's modern `application`
  builder. Native Federation's reference build path.
- **Rspack** — Rust bundler, webpack-API-compatible, ships Module Federation 2.0
  natively; markedly faster builds and lower memory (relevant to CI). Angular
  support is maturing (community/Nx, not official Angular team).
- **Nx** — monorepo toolkit: task graph, computation caching, "affected"-only
  builds, and first-class Module Federation generators. Common backbone for fast
  MFE CI. Note: independent _deployability_ comes from the composition model, not
  the repo layout.
