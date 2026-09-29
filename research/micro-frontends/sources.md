# Sources

Grounding for the findings in this folder. First compiled mid-2026, re-verified
**2026-09-29**; this area moves fast, so re-verify version-specific claims before
relying on them. Release dates were taken from npm publish times where GitHub pages
were ambiguous.

## Angular version & roadmap

- Angular v21 release — https://angular.dev/events/v21
- Angular releases / EOL dates — https://endoflife.date/angular
- Angular zoneless guide — https://angular.dev/guide/zoneless
- Zoneless change detection (LogRocket) — https://blog.logrocket.com/zoneless-change-detection-angular-18/
- Angular release schedule & support policy — https://angular.dev/reference/releases
- Move to one major per year, 24-month support (PR) — https://github.com/angular/angular/pull/69817
- Release-cycle change explained (angular.love, 2026-08) — https://angular.love/angular-new-release-cycle-release-schedule-change-explained
- What's new in Angular 22.1 (Ninja Squad) — https://blog.ninja-squad.com/2026/07/29/what-is-new-angular-22.1
- What's new in Angular 22.2 (Ninja Squad) — https://blog.ninja-squad.com/2026/09/23/what-is-new-angular-22.2
- `provideCssVarNamespacing` API — https://angular.dev/api/platform-browser/provideCssVarNamespacing
- Angular Elements + scoped custom element registries (open issue) — https://github.com/angular/angular/issues/44110
- SSR of Shadow DOM / custom elements (open issue) — https://github.com/angular/angular/issues/48746
- Hydration of server-rendered web components (open issue) — https://github.com/angular/angular/issues/52275
- Hydration transfer-state advisory (fixed in 22.0.1 / 21.2.17) — https://github.com/angular/angular/security/advisories/GHSA-rgjc-h3x7-9mwg

## Native Federation (Angular Architects / Manfred Steyer)

- Announcing Native Federation 1.0 — https://www.angulararchitects.io/blog/announcing-native-federation-1-0/
- Micro Frontends with Angular and Native Federation (Angular Blog) — https://blog.angular.dev/micro-frontends-with-angular-and-native-federation-7623cfc5f413
- `@angular-architects/native-federation` (npm) — https://www.npmjs.com/package/@angular-architects/native-federation
- Modern Angular MFE, Part 1: Standalone & esbuild — https://www.angulararchitects.io/blog/micro-frontends-with-modern-angular-part-1-standalone-and-esbuild/
- Modern Angular MFE, Part 2: Multi-Version & Multi-Framework with Angular Elements & Web Components — https://www.angulararchitects.io/blog/micro-frontends-with-modern-angular-part-2-multi-version-and-multi-framework-solutions-with-angular-elements-and-web-components/
- Native Federation v4 — Angular adapter configuration (`autoShareScope`) — https://native-federation.com/docs/v4/angular-adapter/configuration/
- Native Federation v4 — Angular SSR — https://native-federation.com/docs/v4/angular-adapter/ssr/
- Native Federation v4 — orchestrator Node entry — https://native-federation.com/docs/v4/orchestrator/node/
- Orchestrator version resolver (share / skip / scope / throw) — https://github.com/native-federation/orchestrator/blob/main/docs/version-resolver.md
- Official playground: Angular 22 host + Angular 21 web-component remote — https://github.com/native-federation/playground/tree/main/angular/simple
- Orchestrator releases — https://github.com/native-federation/orchestrator/releases

## Module Federation 2.0

- MF 2.0 stable release — https://module-federation.io/blog/v2-stable-version
- MF 2.0 reaches stable (InfoQ) — https://www.infoq.com/news/2026/04/module-federation-2-stable/
- Module Federation core releases — https://github.com/module-federation/core/releases
- MF shared-dependency configuration — https://module-federation.io/configure/shared.html
- Nx 23 release (Angular Module Federation generators deprecated) — https://nx.dev/blog/nx-23-release
- Nx: migrating Angular Module Federation to Native Federation — https://nx.dev/docs/kb/migrate-angular-module-federation
- Module Federation with SSR & Hydration — https://devm.io/angular/microfrontend-module-federation-ssr-hydration
- Native vs Module Federation comparison — https://blog.stackademic.com/native-federation-vs-module-federation-a-detailed-comparison-451381fec06c
- Native vs Webpack Module Federation, 2026 — https://dev.to/mhmoud_ashour_5547515422e/native-federation-vs-webpack-module-federation-which-should-you-choose-in-2026-109m

## Builders & CI speed

- Nx + Angular with Rspack & Module Federation — https://www.angulararchitects.io/blog/nx-with-rspack-and-module-federation/
- Nx Angular Rspack (experimental status) — https://nx.dev/docs/technologies/angular/angular-rspack/introduction
- Nx 23.1 (Angular 22 + Rspack 2 support) — https://nx.dev/blog/nx-23-1-release
- Rspack blog (2.0–2.2) — https://rspack.rs/blog/
- Rspack vs Webpack, 2026 — https://www.pkgpulse.com/blog/rspack-vs-webpack-drop-in-replacement-2026
- MF 2.0: webpack vs Rspack vs Vite, 2026 — https://www.pkgpulse.com/guides/module-federation-2-webpack-rspack-vite-micro-frontends-2026

## Bundle size, budgets & the "Hydra of Lerna"

- Frontend framework bundle-size benchmark (Angular runtime baseline) — https://dev.to/qingkuai/frontend-framework-bundle-size-benchmark-reactvueangular-vs-fine-grained-runtimes-2nk0
- Performance budgets (Addy Osmani) — https://addyosmani.com/blog/performance-budgets/
- Performance budgets (MDN) — https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Performance_budgets
- Getting started with micro frontends and Angular (duplication / Hydra framing) — https://blog.briebug.com/blog/micro-frontends-angular

## Web platform

- Scoped custom element registries (Chrome 146) — https://developer.chrome.com/blog/scoped-registries
- Firefox 156 release notes (scoped registries in Nightly) — https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/156
- Interop 2026 focus areas — https://github.com/web-platform-tests/interop/blob/main/2026/README.md
- Firefox multiple import maps (implementation / enable-by-default) — https://bugzilla.mozilla.org/show_bug.cgi?id=1916277 , https://bugzilla.mozilla.org/show_bug.cgi?id=2021012
- Chrome 152 release notes (Reference Target) — https://developer.chrome.com/release-notes/152
- Declarative Shadow DOM (Baseline status) — https://web-platform-dx.github.io/web-features-explorer/features/declarative-shadow-dom/
- Native out-of-order HTML streaming (InfoQ, 2026-09) — https://www.infoq.com/news/2026/09/native-deferred-html-streaming/

## Excluded approaches

- single-spa maintenance question (unanswered, 2026) — https://github.com/single-spa/single-spa/issues/1361

## OpenComponents (evaluated, not recommended here)

- OpenComponents docs / intro — https://opencomponents.github.io/docs/intro/
- OpenComponents repo (`opencomponents/oc`) — https://github.com/opencomponents/oc
- Server-side rendering (wiki) — https://github.com/opencomponents/oc/wiki/Server-side-rendering
- Origin: "OpenComponents — microservices in the front-end world" (OpenTable) — https://tech.opentable.co.uk/posts/opencomponents-microservices-in-the-front-end-world/

## Measured locally

The bundle, runtime, and mobile-Lighthouse figures in [`performance.md`](./performance.md)
were measured from the [`isolation-demo/`](./isolation-demo/) project (Angular 22,
zoneless, esbuild, production) on this machine — the three-runtime page run through
Lighthouse's default mobile preset (Moto G4-class CPU + simulated Slow 4G). Not taken
from the sources above; those provide surrounding context and budget references.

## Key people

- **Luca Mezzalira** — _Building Micro-Frontends_ (O'Reilly); decision frameworks,
  the "Hydra of Lerna" framing.
- **Michael Geers** — _Micro Frontends in Action_; micro-frontends.org.
- **Manfred Steyer** (Angular Architects) — Native Federation; Angular MFE authority.
- **Zack Jackson** — original creator of Webpack Module Federation.
