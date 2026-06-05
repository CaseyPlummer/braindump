# Sources

Grounding for the findings in this folder. Accessed mid-2026; this area moves fast,
so re-verify version-specific claims before relying on them.

## Angular version & roadmap

- Angular v21 release — https://angular.dev/events/v21
- Angular releases / EOL dates — https://endoflife.date/angular
- Angular zoneless guide — https://angular.dev/guide/zoneless
- Zoneless change detection (LogRocket) — https://blog.logrocket.com/zoneless-change-detection-angular-18/

## Native Federation (Angular Architects / Manfred Steyer)

- Announcing Native Federation 1.0 — https://www.angulararchitects.io/blog/announcing-native-federation-1-0/
- Micro Frontends with Angular and Native Federation (Angular Blog) — https://blog.angular.dev/micro-frontends-with-angular-and-native-federation-7623cfc5f413
- `@angular-architects/native-federation` (npm) — https://www.npmjs.com/package/@angular-architects/native-federation
- Modern Angular MFE, Part 1: Standalone & esbuild — https://www.angulararchitects.io/blog/micro-frontends-with-modern-angular-part-1-standalone-and-esbuild/
- Modern Angular MFE, Part 2: Multi-Version & Multi-Framework with Angular Elements & Web Components — https://www.angulararchitects.io/blog/micro-frontends-with-modern-angular-part-2-multi-version-and-multi-framework-solutions-with-angular-elements-and-web-components/

## Module Federation 2.0

- MF 2.0 stable release — https://module-federation.io/blog/v2-stable-version
- MF 2.0 reaches stable (InfoQ) — https://www.infoq.com/news/2026/04/module-federation-2-stable/
- Module Federation with SSR & Hydration — https://devm.io/angular/microfrontend-module-federation-ssr-hydration
- Native vs Module Federation comparison — https://blog.stackademic.com/native-federation-vs-module-federation-a-detailed-comparison-451381fec06c
- Native vs Webpack Module Federation, 2026 — https://dev.to/mhmoud_ashour_5547515422e/native-federation-vs-webpack-module-federation-which-should-you-choose-in-2026-109m

## Builders & CI speed

- Nx + Angular with Rspack & Module Federation — https://www.angulararchitects.io/blog/nx-with-rspack-and-module-federation/
- Rspack vs Webpack, 2026 — https://www.pkgpulse.com/blog/rspack-vs-webpack-drop-in-replacement-2026
- MF 2.0: webpack vs Rspack vs Vite, 2026 — https://www.pkgpulse.com/guides/module-federation-2-webpack-rspack-vite-micro-frontends-2026

## Bundle size, budgets & the "Hydra of Lerna"

- Frontend framework bundle-size benchmark (Angular runtime baseline) — https://dev.to/qingkuai/frontend-framework-bundle-size-benchmark-reactvueangular-vs-fine-grained-runtimes-2nk0
- Performance budgets (Addy Osmani) — https://addyosmani.com/blog/performance-budgets/
- Performance budgets (MDN) — https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Performance_budgets
- Getting started with micro frontends and Angular (duplication / Hydra framing) — https://blog.briebug.com/blog/micro-frontends-angular

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
