# Comparison matrix

Candidate approaches for Angular MFE, scored against the criteria that matter for
the **reusable-across-versions** scenario. Ratings are directional
(✅ strong / 🟡 partial-or-with-effort / ❌ weak-or-absent), with detail below.

## The grid

| Criterion                                 | Native Federation     | Module Federation 2.0 (Rspack/webpack)               | Web Components, isolated runtime (Angular Elements) | Web Components, shared runtime (hybrid) | single-spa _(excluded)_ |
| ----------------------------------------- | --------------------- | ---------------------------------------------------- | ------------------------------------------------ | ----------------------------------- | ----------------------- |
| Modern builder, no CommonJS               | ✅ esbuild/ESM        | 🟡 Rspack/webpack                                    | ✅ esbuild/ESM                                   | ✅ esbuild/ESM                      | 🟡                      |
| Independent runtime deploys               | ✅                    | ✅                                                   | ✅                                               | ✅                                  | ✅                      |
| **Same MFE in hosts on different majors** | 🟡 via scoped copies  | 🟡 multi-version, but degrades to duplicate runtimes | ✅ native to the model                           | ✅                                  | 🟡                      |
| Bundle efficiency (aligned versions)      | ✅ one shared runtime | ✅ shared                                            | ❌ duplicated per MFE                            | ✅ shared when aligned              | 🟡                      |
| Avoids forced lockstep upgrades           | 🟡                    | 🟡                                                   | ✅                                               | ✅                                  | 🟡                      |
| SSR + hydration                           | ✅ (aligned only)     | 🟡 (Node runtime; manual for Angular)                | 🟡 fragment SSR, no hydration                    | 🟡 fragment SSR, no hydration       | 🟡                      |
| Rich cross-MFE integration (DI/router)    | ✅                    | ✅                                                   | 🟡 DOM contract only                             | 🟡                                  | 🟡                      |
| Typed contract across boundary            | 🟡                    | ✅ type sharing                                      | 🟡 manual                                        | 🟡                                  | ❌                      |
| Angular CLI integration                   | ✅ first-class        | 🟡 experimental (Nx)                                 | ✅ (`@angular/elements`)                         | ✅ (NF + Elements)                  | 🟡                      |
| Build/CI speed                            | ✅ esbuild            | ✅ Rspack (≈esbuild; 5–10× webpack)                  | ✅ esbuild                                       | ✅ esbuild                          | 🟡                      |
| Multi-framework (polyglot)                | ❌ Angular-only       | ✅                                                   | ✅ via DOM                                       | ✅                                  | ✅                      |
| Maintenance health (2026)                 | ✅ active (small team) | ✅ active                                            | ✅ (Angular core; quiet)                         | ✅ official example                 | ❌ dormant              |
| Uniform boundary / "one solution"         | ✅                    | ✅                                                   | ✅                                               | 🟡 more moving parts                | ✅                      |

> "Polyglot" is a ❌-as-a-strength for Native Federation only because the Angular-only
> scope makes it irrelevant — not a real weakness here.

## Per-approach notes

Ratings are **relative to the reusable-across-versions goal**, so a weak score on an
axis that doesn't matter here (e.g. polyglot) is not a real mark against an approach.
Each note's "Why these ratings" explains the cells that aren't green — i.e. _why_ a
given icon is 🟡 or ❌ (or a notable ✅).

### Native Federation

The modern Angular-native path: esbuild builder, ESM + import maps, first-class CLI
integration, a release for every Angular minor. Used _directly_ — remotes exposing
Angular components or routes into the host's DI tree — it shares Angular as a
**singleton**, so it shines when host + remotes are version-aligned. Its v4 runtime
can now give a mismatched remote its **own** copy of Angular through an import-map
scope, but that only helps a remote that **bootstraps itself**; a component rendered
inside the host's Angular can't run on a different major. In practice, cross-version
Native Federation _is_ the hybrid column.

**Why these ratings:**

- ✅ _Modern builder / CI speed / CLI integration_ — esbuild, ESM + import maps, no
  CommonJS; ships the same day (or next) as each Angular minor.
- ✅ _Bundle efficiency / rich integration_ — the payoff of one shared Angular
  singleton: a single runtime per page, shared DI/router.
- ✅ _SSR (aligned only)_ — documented Node runtime for shared singletons; remotes
  must be reachable at server boot, and federated lazy routes can't be server-rendered.
- 🟡 _Same MFE across majors_ & 🟡 _avoids lockstep_ — version-scoped copies exist,
  but only for self-bootstrapping remotes; directly exposed components still require
  a compatible major, so a major upgrade forces a coordinated flip.
- 🟡 _Typed contract_ — works, but no built-in type-sharing like MF 2.0.
- ✅ _Maintenance_ (small team) — roughly weekly releases, but most commits come from a
  single maintainer.
- ❌ _Polyglot_ — Angular-only (irrelevant to this scope).

### Module Federation 2.0 (on Rspack)

The most feature-rich federation option: Node/SSR runtime, type sharing, runtime
plugins, devtools and observability, multi-version and polyglot support. Its
multi-version capability is real but **degrades to shipping separate runtimes when
majors diverge** — the same cost as web components, with more configuration. For
Angular, the catch is tooling: Angular-on-Rspack is maintained by Nx, self-described
as experimental, and lagged the Angular 22 release by about six weeks; Nx has also
deprecated its Angular Module Federation generators in favor of Native Federation.
A strong choice for shops already on webpack/Rspack, not a reason to leave the
Angular CLI.

**Why these ratings:**

- ✅ _Type sharing / CI speed_ — distributed `.d.ts` sharing; Rspack is comparable to
  esbuild and 5–10× faster than webpack.
- 🟡 _SSR_ — the Node runtime exists, but Angular SSR on MF is manual wiring; the
  migration path Nx documents doesn't cover it.
- 🟡 _Modern builder_ — Rspack/webpack lineage rather than Angular's esbuild builder
  (still ESM).
- 🟡 _Same MFE across majors_ & 🟡 _avoids lockstep_ — multi-version is supported, but
  when majors diverge it falls back to separate runtimes (the web-component cost) with
  more config.
- 🟡 _Angular CLI integration_ — experimental, third-party (Nx); no official Angular
  support for Rspack or Rsbuild.

### Web Components, isolated runtime (Angular Elements)

Each MFE is a custom element carrying its own runtime. **One build runs unchanged
across hosts on different versions**, with zero retrofit when a team lags. Costs: a
duplicated ~35 KB-gzip runtime per MFE on the page (see
[`performance.md`](./performance.md)), SSR becomes hard, and interop is a DOM
contract rather than shared Angular DI. Best fit when version independence is a hard
requirement, MFEs are coarse-grained (few per page), and minimal machinery matters
more than bytes.

**Why these ratings:**

- ✅ _Same MFE across majors_ & ✅ _avoids lockstep_ — native to the model: each MFE
  owns its runtime, so the host's version is irrelevant and laggards block no one.
- ❌ _Bundle efficiency_ — the price of that independence: a duplicated runtime per
  MFE, even when versions match.
- 🟡 _SSR_ — Angular can't hydrate server-rendered web-component markup (open,
  unscheduled issues), but fragment SSR — each MFE renders its own HTML, the element
  replaces it on boot — gives first paint with no layout shift (see
  [`poc-ssr/`](./poc-ssr/)).
- 🟡 _Rich integration_ & 🟡 _typed contract_ — interop is a DOM contract
  (attributes/properties in, events out); cross-boundary types are manual.
- ✅ _Builder / CI / maintenance_ — plain Angular Elements on esbuild, maintained in
  Angular core (stable, with little feature activity).

### Web Components, shared runtime (hybrid)

Custom-element boundary **plus** Native Federation to share the runtime when versions
align and fall back to a private copy when they don't. Native Federation v4 supports
this directly — version-scoped sharing (`autoShareScope`), external pooling, and an
official example of an Angular 22 host loading an Angular 21 web-component remote.
Isolation when needed, dedup when possible.

**Why these ratings:**

- ✅ _Same MFE across majors / avoids lockstep / bundle efficiency_ — the strongest
  column on the version axes: isolation **and** dedup-when-aligned.
- ✅ _Builder / CLI / CI_ — the same esbuild builder and Native Federation schematics
  as plain Native Federation.
- 🟡 _SSR_ — fragment SSR works as for self-contained MFEs (verified in
  [`poc-ssr/`](./poc-ssr/)); hydration across the boundary doesn't. Native
  Federation's own SSR mode targets shared-singleton remotes, so the host's server
  stays unfederated.
- 🟡 _Rich integration / typed contract_ — the same DOM contract as self-contained
  web components.
- 🟡 _Uniform boundary_ — the boundary is uniform, but there are two systems to
  understand (web-component packaging **plus** federation sharing) and more
  configuration than the Isolated host.

### single-spa _(excluded)_

First-generation orchestrator. Excluded from recommendations for new work due to
maintenance status (no stable release since 6.0.3, the 7.0 beta idle since 2025,
community questions about abandonment unanswered) and the availability of federation + native web-component
approaches that cover the same needs with better ergonomics. Listed only to record
the rationale for not choosing it.

**Why these ratings:** mostly 🟡/❌ — dated tooling, weak cross-boundary typing, and
❌ maintenance health are the deciding marks; capabilities it does have are matched or
beaten by the live options above.

### OpenComponents (evaluated — different category, not recommended here)

OpenComponents (OC) is a mature, language-agnostic micro-frontend framework (created at
OpenTable in 2014; ~1.5k GitHub stars). It is a **different category** from the rows
above: a **registry + its own component model**, not federation and **not native web
components**. Producers publish immutable, semver'd components to a REST **registry**;
consumers render them client- or server-side, and the registry can return
**server-rendered HTML so any backend (C#, PHP, Java, Go…) gets SSR without Node on the
edge**. That polyglot, Node-less-SSR capability is its real strength.

**Fit for an Angular-only, web-component-boundary strategy — weak:**

- ❌ **Boundary mismatch** — if you standardize on **native web components** as the
  MFE boundary, OC's **own oc-component model** is a competing, non-standard boundary
  abstraction.
- ❌ **Not Angular-native** — not built around the Angular CLI, esbuild, Angular
  Elements, or Native Federation; you'd bolt Angular into OC's registry/template model
  rather than use Angular's own modern MFE story.
- ❌ **Two frameworks, not one** — OC is itself a framework (its own CLI, the
  `template` + `server.js` data-layer contract, the `oc-client` runtime, and the
  registry). Adopting it means developers learn and maintain **two** frameworks —
  Angular **plus** OC — with Angular nested as an implementation detail inside an OC
  template. The recommended web-component path adds **a browser standard, not a
  framework**: `@angular/elements` + `customElements.define()`, so it stays **one
  framework + a standard**. For a goal of letting Angular teams keep shipping Angular,
  that developer-experience gap is decisive.
- ⚪ **Headline strengths don't apply** — polyglot and Node-less edge SSR solve problems
  this scenario doesn't have (Angular-only; SSR is a stretch goal).
- ✅ **One transferable idea** — OC's **versioned component registry** (immutable,
  semver'd artifacts; a producer/consumer contract) is exactly the **manifest/registry**
  the recommended host needs for runtime-remote discovery. Borrow the idea without
  adopting the framework.
- 🟡 **Momentum** — proven and steadily patched, but a smaller ecosystem than Module/Native Federation; for a
  forward-looking Angular standard the Angular-native path carries less framework-bet risk.

**Verdict:** capable and battle-tested, but its strengths are orthogonal to this
strategy and its component model conflicts with the boundary decision. Borrow the
registry pattern; don't adopt the framework.

## How to read this for a decision

1. If **versions can be aligned** → Native Federation (Angular-native, SSR for
   shared singletons), or MF 2.0 on Rspack if you're already on that toolchain.
2. If **the same MFE must run across different host versions** → web components as
   the boundary. By default each MFE carries its own runtime (isolated), with a
   framework-agnostic platform contract for cross-cutting concerns; Native
   Federation's version-scoped sharing (the hybrid column) is the alternative for
   pages with many feature-rich MFEs.

The deciding input is the version question, not the feature checklist. See
[`recommendation.md`](./recommendation.md).
