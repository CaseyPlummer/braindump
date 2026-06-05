# Comparison matrix

Candidate approaches for Angular MFE, scored against the criteria that matter for
the **reusable-across-versions** scenario. Ratings are directional
(✅ strong / 🟡 partial-or-with-effort / ❌ weak-or-absent), with detail below.

## The grid

| Criterion                                 | Native Federation     | Module Federation 2.0 (Rspack/webpack)               | Self-contained Web Components (Angular Elements) | WebComponents + Federation (hybrid) | single-spa _(excluded)_ |
| ----------------------------------------- | --------------------- | ---------------------------------------------------- | ------------------------------------------------ | ----------------------------------- | ----------------------- |
| Modern builder, no CommonJS               | ✅ esbuild/ESM        | 🟡 Rspack/webpack                                    | ✅ esbuild/ESM                                   | 🟡 mixed                            | 🟡                      |
| Independent runtime deploys               | ✅                    | ✅                                                   | ✅                                               | ✅                                  | ✅                      |
| **Same MFE in hosts on different majors** | ❌ singleton-bound    | 🟡 multi-version, but degrades to duplicate runtimes | ✅ native to the model                           | ✅                                  | 🟡                      |
| Bundle efficiency (aligned versions)      | ✅ one shared runtime | ✅ shared                                            | ❌ duplicated per MFE                            | ✅ shared when aligned              | 🟡                      |
| Avoids forced lockstep upgrades           | ❌                    | 🟡                                                   | ✅                                               | ✅                                  | 🟡                      |
| SSR + hydration                           | ✅ (Angular 18+)      | ✅ (Node runtime)                                    | ❌ very hard                                     | 🟡 hard                             | 🟡                      |
| Rich cross-MFE integration (DI/router)    | ✅                    | ✅                                                   | 🟡 DOM contract only                             | 🟡                                  | 🟡                      |
| Typed contract across boundary            | 🟡                    | ✅ type sharing                                      | 🟡 manual                                        | 🟡                                  | ❌                      |
| Angular CLI integration                   | ✅ first-class        | 🟡 improving                                         | ✅ (`@angular/elements`)                         | 🟡                                  | 🟡                      |
| Build/CI speed                            | ✅ esbuild            | ✅ Rspack (5–10×)                                    | ✅ esbuild                                       | 🟡                                  | 🟡                      |
| Multi-framework (polyglot)                | ❌ Angular-only       | ✅                                                   | ✅ via DOM                                       | ✅                                  | ✅                      |
| Maintenance health (2026)                 | ✅ active             | ✅ active                                            | ✅ (Angular core)                                | 🟡                                  | ❌ legacy               |
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
integration, SSR since Angular 18. Shares Angular as a **singleton**, so it shines
when host + remotes are version-aligned — and _that constraint is its defining
limitation_ for the reusable-ingredient case: it cannot run one MFE build inside
hosts on different majors without falling back to duplicate runtimes (at which
point you are effectively doing the web-component approach with extra coupling).

**Why these ratings:**

- ✅ _Modern builder / CI speed_ — esbuild, ESM + import maps, no CommonJS.
- ✅ _Bundle efficiency / SSR / rich integration_ — the payoff of one shared Angular
  singleton: a single runtime per page, shared DI/router, SSR since v18.
- ❌ _Same MFE across majors_ & ❌ _avoids lockstep_ — the singleton's flip side: all
  parties on a page must share a compatible (same-major) Angular, so a major upgrade
  forces a coordinated flip and one build can't serve hosts on different majors.
- 🟡 _Typed contract_ — works, but no built-in type-sharing like MF 2.0.
- ❌ _Polyglot_ — Angular-only (irrelevant to this scope).

### Module Federation 2.0 (on Rspack)

The fastest-build, most feature-rich federation option: Node/SSR runtime, type
sharing, isomorphic data fetching, multi-version and polyglot support. Its
multi-version capability is real but **degrades to shipping separate runtimes when
majors diverge** — i.e. the same cost as web components, with more configuration.
Strong choice _if_ versions are mostly aligned and CI speed / typed contracts are
priorities. Angular+Rspack tooling is maturing (community/Nx), not yet official.

**Why these ratings:**

- ✅ _SSR / type sharing / CI speed_ — Node runtime, distributed `.d.ts` sharing,
  Rspack builds 5–10× faster with lower memory.
- 🟡 _Modern builder_ — Rspack/webpack lineage rather than esbuild-native (still ESM).
- 🟡 _Same MFE across majors_ & 🟡 _avoids lockstep_ — multi-version is supported, but
  when majors diverge it falls back to separate runtimes (the web-component cost) with
  more config; singleton sharing still nudges toward alignment.
- 🟡 _Angular CLI integration_ — Angular+Rspack is community/Nx-maintained, not official.

### Self-contained Web Components (Angular Elements)

Each MFE is a custom element carrying its own runtime. **The only model where one
build runs unchanged across hosts on different versions**, with zero retrofit when
a team lags. Costs: a duplicated ~35 KB-gzip runtime per _distinct live version_
per page (see [`performance.md`](./performance.md)), SSR becomes hard, and interop
is a DOM contract rather than shared Angular DI. Best fit when version independence
is a hard requirement and MFEs are coarse-grained (few per page).

**Why these ratings:**

- ✅ _Same MFE across majors_ & ✅ _avoids lockstep_ — native to the model: each MFE
  owns its runtime, so the host's version is irrelevant and laggards block no one.
- ❌ _Bundle efficiency_ — the price of that independence: a duplicated ~35 KB-gzip
  runtime per distinct live version on a page.
- ❌ _SSR_ — multiple self-contained runtimes make SSR impractical.
- 🟡 _Rich integration_ & 🟡 _typed contract_ — interop is a DOM contract
  (attributes/properties in, events out); cross-boundary types are manual.
- ✅ _Builder / CI / maintenance_ — plain Angular Elements on esbuild, maintained in
  Angular core.

### Web Components + Federation (hybrid)

Custom-element boundary **plus** federation to share the runtime when versions
align and fall back to a private copy when they don't. Best-of-both on paper:
isolation when needed, dedup when possible. The cost is complexity — more moving
parts, cutting against a "one simple solution" mandate. Best treated as a
documented optimization layered on the web-component boundary, not the headline.

**Why these ratings:**

- ✅ _Same MFE across majors / avoids lockstep / bundle efficiency_ — the strongest
  column on the version axes: isolation **and** dedup-when-aligned.
- 🟡 _everywhere else_ — the price is machinery: two systems (web-component packaging
  **plus** federation sharing) and more configuration; SSR is still hard, and the extra
  moving parts cut against "one simple solution". Maturity is 🟡 because this specific
  combination is less trodden than either part alone.

### single-spa _(excluded)_

First-generation orchestrator. Excluded from recommendations for new work due to
maintenance status and the availability of federation + native web-component
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

- ❌ **Boundary mismatch** — standardizing on **native web components** is the locked
  decision; OC uses its **own oc-component model**, i.e. a non-standard boundary
  abstraction, the opposite of that decision.
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
- 🟡 **Momentum** — proven, but a smaller ecosystem than Module/Native Federation; for a
  forward-looking Angular standard the Angular-native path carries less framework-bet risk.

**Verdict:** capable and battle-tested, but its strengths are orthogonal to this
strategy and its component model conflicts with the boundary decision. Borrow the
registry pattern; don't adopt the framework.

## How to read this for a decision

1. If **versions can be aligned** → Native Federation (Angular-native, SSR-ready)
   or MF 2.0 on Rspack (speed + typed contracts).
2. If **the same MFE must run across different host versions** → self-contained
   Web Components as the boundary, optionally with the federation hybrid to dedup
   when aligned.

The deciding input is the version question, not the feature checklist. See
[`recommendation.md`](./recommendation.md).
