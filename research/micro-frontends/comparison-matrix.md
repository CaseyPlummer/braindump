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

### Native Federation

The modern Angular-native path: esbuild builder, ESM + import maps, first-class CLI
integration, SSR since Angular 18. Shares Angular as a **singleton**, so it shines
when host + remotes are version-aligned — and _that constraint is its defining
limitation_ for the reusable-ingredient case: it cannot run one MFE build inside
hosts on different majors without falling back to duplicate runtimes (at which
point you are effectively doing the web-component approach with extra coupling).

### Module Federation 2.0 (on Rspack)

The fastest-build, most feature-rich federation option: Node/SSR runtime, type
sharing, isomorphic data fetching, multi-version and polyglot support. Its
multi-version capability is real but **degrades to shipping separate runtimes when
majors diverge** — i.e. the same cost as web components, with more configuration.
Strong choice _if_ versions are mostly aligned and CI speed / typed contracts are
priorities. Angular+Rspack tooling is maturing (community/Nx), not yet official.

### Self-contained Web Components (Angular Elements)

Each MFE is a custom element carrying its own runtime. **The only model where one
build runs unchanged across hosts on different versions**, with zero retrofit when
a team lags. Costs: a duplicated ~35 KB-gzip runtime per _distinct live version_
per page (see [`performance.md`](./performance.md)), SSR becomes hard, and interop
is a DOM contract rather than shared Angular DI. Best fit when version independence
is a hard requirement and MFEs are coarse-grained (few per page).

### Web Components + Federation (hybrid)

Custom-element boundary **plus** federation to share the runtime when versions
align and fall back to a private copy when they don't. Best-of-both on paper:
isolation when needed, dedup when possible. The cost is complexity — more moving
parts, cutting against a "one simple solution" mandate. Best treated as a
documented optimization layered on the web-component boundary, not the headline.

### single-spa _(excluded)_

First-generation orchestrator. Excluded from recommendations for new work due to
maintenance status and the availability of federation + native web-component
approaches that cover the same needs with better ergonomics. Listed only to record
the rationale for not choosing it.

## How to read this for a decision

1. If **versions can be aligned** → Native Federation (Angular-native, SSR-ready)
   or MF 2.0 on Rspack (speed + typed contracts).
2. If **the same MFE must run across different host versions** → self-contained
   Web Components as the boundary, optionally with the federation hybrid to dedup
   when aligned.

The deciding input is the version question, not the feature checklist. See
[`recommendation.md`](./recommendation.md).
