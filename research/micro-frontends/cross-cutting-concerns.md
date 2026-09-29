# Cross-cutting concerns

A checklist of the application-wide concerns a micro-frontend architecture has to
answer, and how each is handled under the two host styles in this research:

- **Isolated** runtime — each MFE is a web component bundling its own Angular,
  loaded with a plain script tag from a manifest. No federation.
- **Shared** runtime — the same web-component MFEs loaded through Native Federation,
  sharing Angular among apps on the same major.

## The principle: a platform contract, not shared modules

Native Federation can share a library _instance_ (a store, an auth service) between
MFEs — but only between MFEs on the same Angular major. When an MFE falls a major
behind, it gets its own copy of every shared package, and "shared state via a shared
module" silently becomes two states. Version skew is exactly the case this
architecture exists to support, so shared modules can't be the foundation for
cross-cutting behaviour under **either** host.

The dependable foundation is a **platform contract** that doesn't depend on
framework versions:

- **A small platform SDK** in plain TypeScript (no Angular dependency), owned by a
  platform team, loaded **once** by the host, and versioned with a
  backward-compatible API.
- **Context over the DOM** — MFEs request what they need (session, locale, theme,
  flags, token provider) through the Web Components
  [Context Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md)
  (`context-request` events, also implemented by `@lit/context`), and the host
  answers.
- **Events over the DOM or an SDK bus** — parent/child via DOM events; many-to-many
  via typed, versioned events on the SDK's bus.

With that contract in place, the Isolated host loses little by not using
federation, and the Shared host gains a mechanism that keeps working during skew.

## The checklist

| Concern                         | Approach (either host)                                                                                                                                                                                                               | What Native Federation adds                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **Shared state / context**      | Platform SDK exposes read-only state + subscriptions (session, tenant, locale, theme, flags) via the Context Protocol; versioned contract                                                                                            | A shared library instance — only for MFEs on the same major                 |
| **Auth / session**              | Host owns login. Simplest: same-origin cookie session via a backend-for-frontend, so MFEs just call APIs. Otherwise the SDK exposes `getAccessToken()` and each MFE's HTTP interceptor calls it. MFEs never run their own login flow | A shared auth service while versions match                                  |
| **Routing / deep links**        | Host owns the URL; passes each MFE its sub-path as an input; MFE emits `navigate` events the host applies. An MFE with internal routes keeps its router in sync with that input rather than listening to the address bar             | Aligned MFEs' routes can be lazy-loaded into the host router directly       |
| **Cross-MFE events**            | DOM events for parent/child; SDK event bus with typed, versioned event names for broadcast                                                                                                                                           | —                                                                           |
| **Design system / theming**     | Framework-agnostic web-component library loaded once by the host; design tokens as CSS custom properties (they inherit through shadow DOM); `provideCssVarNamespacing()` or CSS `@scope` for style isolation                         | —                                                                           |
| **Shared libraries**            | Angular stays per-MFE (Isolated) or per-major (Shared). Framework-agnostic libraries can be shared with a **plain import map** — no federation needed                                                                                | Automatic sharing and version negotiation for all dependencies              |
| **Discovery, deploy, rollback** | A manifest on the CDN pointing at immutable, versioned bundle URLs; canary and rollback by changing the manifest                                                                                                                     | A standard metadata format for the same idea                                |
| **Typed contracts**             | Each MFE publishes a small types package (tag name, inputs, events) augmenting `HTMLElementTagNameMap`; contract tests in CI                                                                                                         | — (type sharing is a Module Federation 2.0 feature)                         |
| **Resilience**                  | Loader applies a timeout per MFE, renders fallback UI on failure, and isolates errors so one broken MFE never breaks the page                                                                                                        | —                                                                           |
| **Observability**               | SDK provides telemetry and correlation IDs; real-user monitoring tagged per MFE and version; skew visible from the manifest/registry                                                                                                 | Runtime logs of version-resolution decisions                                |
| **Internationalization**        | Host provides locale via context; each MFE bundles its own translations                                                                                                                                                              | —                                                                           |
| **Security**                    | `integrity` (SRI) in the manifest and loader; a content security policy limited to your CDN; Trusted Types; treat server-rendered fragments as trusted input only from your own endpoints                                            | SRI via import-map `integrity`                                              |
| **Accessibility**               | Each MFE labels its own controls (ARIA references can't cross shadow roots outside Chromium's Reference Target); host manages focus on route changes                                                                                 | —                                                                           |
| **Local development**           | A manifest override (query parameter or localStorage, honoured only in development) points the host at a local MFE dev server; a standalone harness page per MFE                                                                     | `ng serve` per remote and schematic conventions                             |
| **Governance**                  | Shared starter template, a version policy, and a registry recording each MFE's Angular version and owner                                                                                                                             | —                                                                           |
| **SSR**                         | Fragment SSR: each MFE renders its own HTML; the element replaces it on boot (see [`poc-ssr/`](./poc-ssr/))                                                                                                                          | Singleton SSR for aligned remotes — not applicable to web-component remotes |

**Proven in [`poc-isolated/`](./poc-isolated/)** (Angular 22 and 21 MFEs on one
page, no federation): a 1 kB-gzip platform SDK loaded once via a plain import map;
Context Protocol contexts (session, locale, theme, flags) updating MFEs on both majors
live; a token provider feeding each MFE's HTTP interceptor; a versioned event bus
working across majors; URL-sync routing for an MFE with internal routes (deep links,
back/forward, redirects, one history write per navigation, all by the host); loader
timeout, fallback UI and SRI rejection with other MFEs unaffected; and a
localhost-only manifest override for local development.

## What the Isolated host gives up

1. **Module singletons shared between aligned MFEs** — replaced by the platform SDK,
   which both hosts need anyway for skewed versions.
2. **Loading an MFE's routes straight into the host router** — replaced by a URL-sync
   contract. Slightly less seamless, but it works across versions.
3. **Off-the-shelf tooling** — replaced by platform code you own: a loader (tens of
   lines), a manifest schema, a local-dev override, and a starter template.

In exchange it has no upgrade-ordering rule, loads faster at typical MFE counts, and
has no federation release to coordinate with each Angular minor (see
[`performance.md`](./performance.md) and [`recommendation.md`](./recommendation.md)).

## Design notes

- **Keep the SDK small and boring.** It is the one dependency every MFE shares, so
  treat its API like a public API: semver, deprecation windows, no breaking changes
  without a major version, and a compatibility test suite run against old MFEs.
- **Make context read-only.** MFEs request changes through events or SDK methods
  (e.g. `session.refresh()`); the host decides. This keeps a single source of truth.
- **Version events, not just the SDK.** Name events with a version suffix
  (`cart.itemAdded@1`) so producers can evolve payloads without breaking consumers.
- **Prefer cookies over tokens where you can.** A same-origin session through a
  backend-for-frontend removes token passing from the contract entirely.
- **Put the contract in the starter template.** Teams should get the context helper,
  HTTP interceptor, and event-bus client for free when they create an MFE.
