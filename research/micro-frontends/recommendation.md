# Recommendation

For the scenario this research targets: **Angular MFEs reused as features across
multiple host applications, where hosts may sit on different framework versions and
teams ship on independent schedules.** Adjust if your version constraints differ —
the decision gate below makes the dependency explicit.

**Last reviewed: 2026-09-29.**

## The decision

1. **Every MFE is a web component** (Angular Elements) — the one integration
   boundary for all MFEs.
2. **Hosts use the Isolated runtime by default** — each MFE bundles its own Angular
   and is loaded with a plain script tag from a manifest. No federation.
3. **Cross-cutting concerns go through a small platform contract** — a
   framework-agnostic SDK loaded once by the host (context, auth token, event bus)
   plus a URL-sync routing contract. See
   [`cross-cutting-concerns.md`](./cross-cutting-concerns.md).
4. **The Shared runtime (Native Federation) is a documented, tested alternative** —
   adopted per host only when a [revisit trigger](#revisit-triggers) applies. The
   boundary and the platform contract are identical under both, so switching never
   requires an MFE rewrite.

## Decision gate

> **Can every host that embeds an MFE be held to a compatible Angular version?**

- **Yes, reliably** → consider **Native Federation** used directly (remotes exposing
  components and routes into one shared Angular). One runtime per page; the richest
  integration; SSR for shared singletons. **Module Federation 2.0 on Rspack** is the
  alternative for shops already on webpack/Rspack, but Angular-on-Rspack is still
  self-described as experimental.
- **No / not reliably** → the requirement is **version independence**: each MFE must
  boot on its own Angular when the page's Angular doesn't match. The rest of this
  document covers that case.

## Decision matrix: Isolated vs Shared runtime

Both hosts use the same web-component MFEs and the same platform contract; they differ
only in where each MFE's Angular comes from. Priority reflects the scenario: version
independence first, performance second. Figures are measured in this folder's POCs
(Angular 22.2, host + MFEs, mobile Lighthouse preset) unless stated otherwise.

| Criterion                            | Priority  | Isolated runtime                                                         | Shared runtime (Native Federation)                                                                                   |
| ------------------------------------ | --------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **No forced lockstep**               | Primary   | ✅ Each MFE runs any Angular version, unchanged                          | ✅ Mismatched MFEs get a private copy via import-map scopes                                                          |
| **Upgrade ordering**                 | Primary   | ✅ None — teams upgrade in any order                                     | 🟡 Hosts must upgrade first; an MFE ahead of its host, even by a minor, silently loads its own full runtime          |
| **Toolchain coupling**               | Primary   | ✅ Plain Angular CLI + Angular Elements                                  | 🟡 Each Native Federation release targets one Angular minor; every Angular minor upgrade needs a matching NF upgrade |
| **Load time, 1–5 MFEs**              | Secondary | ✅ LCP 2.0 s (2 MFEs), 2.6 s (5)                                         | ❌ LCP 3.4 s (2 MFEs), 3.6 s (5) — module-discovery round trips                                                      |
| **Bytes, 1–5 MFEs**                  | Secondary | ✅ ~111 kB gzip (host + 2 bare MFEs)                                     | ❌ ~231 kB — shared packages can't be tree-shaken                                                                    |
| **Bytes, many or feature-rich MFEs** | Secondary | 🟡 Every MFE carries its own router/HTTP (~40–80 kB gzip each)           | ✅ ~2 kB per aligned MFE after the fixed cost                                                                        |
| **Cost of version skew**             | Secondary | ✅ An MFE a major behind costs the same as any other (~+37 kB)           | ❌ An MFE a major behind brings a whole untree-shaken Angular (~+177 kB)                                             |
| **Shared state / auth / events**     | Primary   | ✅ Platform contract, proven across Angular 21 and 22                    | 🟡 Shared module instances only while versions match; needs the same platform contract for skew                      |
| **Routing integration**              | Secondary | 🟡 URL-sync contract (host owns the URL); proven, slightly less seamless | ✅ Aligned MFEs' routes can load straight into the host router                                                       |
| **Tooling & conventions**            | Secondary | 🟡 Own a small loader, manifest schema, dev override, adapter            | ✅ Schematics, per-remote dev server, standard metadata                                                              |
| **Dependency risk**                  | Secondary | ✅ Angular Elements ships inside Angular                                 | 🟡 Active, but most commits from a single maintainer                                                                 |
| **Ecosystem & momentum**             | Secondary | 🟡 Standards-based; no MFE-specific community                            | ✅ The Angular community's MFE standard; downloads ~2.5× in a year                                                   |
| **SSR**                              | Stretch   | 🟡 Fragment SSR, no hydration (proven)                                   | 🟡 Same fragment SSR (proven); NF's own SSR doesn't cover web-component remotes                                      |
| **Moving parts**                     | Secondary | ✅ Script loader + manifest + SDK                                        | 🟡 Adds orchestrator, import-map shims, share scopes, pooling config                                                 |
| **Reversibility**                    | Primary   | ✅ Switch to Shared later: host + build config only                      | ✅ Switch to Isolated later: host + build config only                                                                |

### Isolated runtime — pros and cons

**Pros**

- No upgrade-ordering rule and no toolchain coupling beyond Angular itself.
- Fastest load at typical MFE counts; version skew adds no extra cost.
- Fewest moving parts; Angular Elements is maintained in Angular core.
- Each MFE is a plain, self-sufficient artifact — easy to reason about, test and
  deploy.

**Cons**

- Every MFE carries its own copy of the Angular features it uses (router, HTTP,
  forms), so bytes grow with feature-rich MFEs.
- You own some platform code: SDK, loader, manifest schema, a small Angular adapter
  per Angular major, starter template.
- MFE routes can't be loaded directly into the host router.
- No MFE-specific ecosystem tooling or community conventions.

### Shared runtime — pros and cons

**Pros**

- Aligned MFEs are nearly free (~2 kB each) after the fixed cost; the cost curve is
  flat for pages with many MFEs.
- Shared module instances and direct route integration between aligned apps.
- Community-standard tooling, docs and conventions.

**Cons**

- Slower at typical MFE counts (+1.4 s LCP on mobile in the measured setup).
- Hosts must upgrade first; NF upgrades track every Angular minor.
- An MFE on another major is expensive (whole untree-shaken Angular).
- Shared state still needs the platform contract, because sharing stops at a
  version boundary.
- More configuration per team; concentrated maintenance upstream.

## Why Isolated — the long-term justification

1. **It satisfies the primary requirement with no conditions attached.** Freedom
   from lockstep is the reason this architecture exists. The Shared runtime avoids
   hard lockstep but reintroduces a softer coordination layer (host-first upgrades,
   NF-per-Angular-minor releases, compatible shared-dependency config). The Isolated
   runtime has none.
2. **The Shared runtime's main unique benefit isn't load-bearing.** Sharing module
   instances only works between aligned MFEs, so any cross-cutting behaviour that
   must survive version skew needs a framework-agnostic platform contract anyway.
   With that contract in place (proven in [`poc-isolated/`](./poc-isolated/)), what
   remains exclusive to the Shared runtime is direct route integration and tooling.
3. **It performs better at the expected page composition.** Coarse, domain-level
   MFEs at 1–2 per page (5 at most) load faster isolated. The Shared runtime's
   advantage appears only at higher counts of feature-rich MFEs.
4. **It bets on the most durable dependencies.** Web components and Angular Elements
   are a browser standard and an Angular core package. Angular now ships one major
   per year with 24 months of support, so skew windows are predictable; nothing in
   the Isolated path has to move in step with them.
5. **It is the cheaper option to reverse.** The boundary and platform contract carry
   over unchanged. Moving a host to the Shared runtime later is a host-side and
   build-config change; starting there means paying its coordination costs from day
   one for a benefit that may never be needed.

## Revisit triggers

Re-open this decision for a host (or the standard) when any of these hold:

- Pages regularly compose **~5 or more feature-rich MFEs**, and measured load time or
  bytes exceed budget.
- Teams need MFE **routes integrated directly** into the host router, and can hold
  versions aligned.
- **Full SSR with hydration** becomes a requirement (points toward a version-aligned,
  shared-singleton setup).
- **Native Federation** gains tree-shaking of shared packages, decouples releases from
  Angular minors, or broadens its maintainer base.
- **Angular Elements** supports scoped custom element registries, and they ship in
  all stable browsers — simplifying multiple versions of one MFE on a page.

## The pattern

1. **Make every MFE a custom element (Angular Elements).** Every host mounts every
   MFE the same way, and each MFE boots itself rather than joining the host's DI
   tree — which is what makes version independence possible.

2. **Let each MFE carry its own Angular; share only framework-agnostic pieces.** The
   host loads the platform SDK and the design system once; MFEs bundle Angular and
   the Angular features they use. Framework-agnostic libraries can be shared with a
   plain import map, without federation.

3. **Route cross-cutting concerns through the platform contract.** Context (session,
   locale, theme, flags) via the Web Components Context Protocol, a token provider,
   a versioned event bus, and URL-sync routing — never through shared Angular
   services. See [`cross-cutting-concerns.md`](./cross-cutting-concerns.md).

4. **Compose flat: host → list of MFEs.** The host is a thin shell (routing,
   layout, auth/session, platform SDK, design system). MFEs are siblings, never
   nested in each other. Cap any MFE-in-MFE case at one level and require explicit
   sign-off; arbitrary nesting builds a distributed monolith.

5. **Define an MFE as one domain.** Coarse-grained, domain-level MFEs keep per-page
   count low (a workable envelope is **1–2 typical, ~5 maximum**), which keeps
   duplication inside budget.

6. **Adopt a version _policy_, not version _lockstep_.** For example, "MFEs stay
   within one Angular major of the current release," with a rare, explicitly
   approved exception. Under the Isolated runtime the policy exists for support and
   security, not for compatibility. Angular ships **one major per year** with **24
   months** of support, so a one-major policy means a migration window about once a
   year with both majors fully supported throughout.

## Host architecture

The host does three things: **know each MFE's bundle URL** (a manifest/registry),
**load the script** at runtime, and **render the custom element** (with
`CUSTOM_ELEMENTS_SCHEMA` so Angular accepts the unknown tag; pass data via
property/attribute bindings, receive DOM events). How it loads the script is the only
difference between the two host styles.

### Isolated runtime (default) — regular Angular, no federation

A normal Angular app with a small **loader service** that injects each MFE's
`<script type="module">` from a **manifest** of element name → URL, with a timeout,
fallback UI and `integrity` (SRI) per MFE. The host also provides the platform SDK
(via a plain import map) and answers context requests. No federation, no special
builder. Realized in [`poc-isolated/`](./poc-isolated/), including an Angular 21 MFE
alongside Angular 22 ones on the same platform contract.

### Shared runtime (alternative) — regular Angular + Native Federation

Native Federation acts as the host's **import-map + dependency-sharing + loading
layer**. When an MFE's Angular major matches what the page loaded, it reuses that
runtime; when it doesn't, it gets its own copy in a separate import-map scope. MFEs
are still web components. Realized in [`poc-shared/`](./poc-shared/), including an
Angular 21 remote on its own runtime.

Configuration that matters if you adopt it:

- **`autoShareScope({ level: 'major' })`** on host and remotes, so sharing groups by
  major (the default groups by minor). Consider scoping only the Angular family, so
  version-agnostic packages like `rxjs` stay shared across majors.
- **Auto external pooling** (`useAutoExternalPooling`) in the host, so a remote never
  mixes `@angular/*` packages from different builds.
- **Keep `includeSecondaries: { keepAll: true }` on `@angular/core`**; without it,
  apps in a scope must import identical core entry points.
- **`es-module-shims` stays** — runtime-loaded remotes need shim mode, and one major
  browser still lacks multiple import maps.
- **Hosts upgrade first**, including minors; document this in the team contract.

In both styles the host stays **thin**, and MFE source is identical — only host
wiring and build differ. [`isolation-demo/`](./isolation-demo/) is a deliberately
minimal static page that proves runtime isolation; it is not a realistic host.

## Server-side rendering

SSR remains a **stretch goal** on this architecture. Angular cannot yet
server-render a custom element's content into shadow DOM or hydrate server-rendered
web-component markup (both are open, unscheduled framework issues), and Native
Federation's SSR support covers shared singletons, not web-component remotes or
version-scoped copies.

The viable path today is **fragment SSR without cross-boundary hydration**,
verified end to end in [`poc-ssr/`](./poc-ssr/) for both host styles:

1. Each MFE exposes a small SSR endpoint that renders its own component to an HTML
   fragment (`renderApplication`, light DOM, a unique `APP_ID`, no transfer state).
2. The host is an Angular SSR app. During server rendering it fetches each fragment
   with a tight timeout and places it directly inside `<mfe-x>` as initial content;
   on timeout or error it renders the empty element and the MFE renders client-side.
3. In the browser the host hydrates normally, then the element boots and replaces the
   server markup with the live component.

Rules that make it work:

- **Don't use `ngSkipHydration` around MFE elements.** On the element itself it breaks
  host boot (NG0504); on a wrapper it makes the host discard the fragment, bringing
  the layout shift back. Host hydration accepts the fragment as long as the host puts
  **no children of its own** inside the MFE element.
- **Don't enable hydration in the MFE's browser app.** Takeover relies on Angular
  Elements clearing the server markup.
- **Give every MFE a unique `APP_ID`.** Two builds of the same component (e.g. on
  different majors) generate the same component IDs, so styles collide under the
  default ID.
- **Keep federation out of the host's server** (Shared runtime only). Only the
  host's browser build is federated; Native Federation's own SSR mode is designed for
  shared-singleton remotes and failed in this setup.

Measured result: layout shift from the MFE drops from ~0.3 CLS to **0**, and the
MFE's content paints in ~250 ms instead of 2.5–9 s on a throttled mobile profile, at
~30 ms of extra server time per request (fragments fetched in parallel). It works
across versions because each MFE renders itself. Costs: the MFE renders twice
(server, then client), data is fetched twice, every page request waits on the
fragment fan-out (bounded by the timeout), clicks before takeover are lost, and the
host must trust the fragment HTML it inserts.

## Repo topology & delivery

- **Polyrepo fits this model.** One repo (or set) per domain team matches Conway's
  law and the runtime-remote independence goal. Independent _deployability_ comes
  from runtime composition, not the repo layout.
- **Make polyrepo scale with shared scaffolding**, since the cost of polyrepo is
  drift: a shared **MFE starter/template** (build config, element wrapping, the
  platform adapter, HTTP interceptor and context helpers), a **published platform
  SDK** and **shared component library** (versioned, framework-agnostic), and a
  **central manifest/registry** the host reads to discover MFE URLs. Per-repo **Nx**
  is still useful for caching and affected builds — Nx is not monorepo-only.
- **Delivery: runtime remotes from a CDN.** Hosts load MFEs live from a manifest of
  immutable, versioned bundle URLs served at the **edge** — fast first byte, strong
  caching, safe rollbacks and deterministic deploys; `integrity` hashes in the
  manifest add subresource integrity.

## Costs accepted

State these explicitly when proposing the pattern:

- **Per-MFE framework cost** — each MFE carries its own Angular and the Angular
  features it uses (~35–37 kB gzip bare; ~80 kB with router and HTTP).
- **Platform code to own** — SDK, loader, manifest schema, per-major Angular adapter,
  starter template.
- **SSR is not first-class** — fragment SSR works (first paint, no layout shift);
  hydration across the boundary does not, so each MFE renders twice.
- **DOM-contract interop** — attributes/properties + events + platform contract, not
  shared Angular DI. Fine for coarse, mostly-self-contained domain MFEs.

## Page-level isolation concerns

Sharing a page means sharing some global namespaces. Handle each deliberately:

- **Custom-element tag names** — global per page. Use unique (e.g. version-suffixed)
  tags and a define-once guard. _Scoped custom element registries_ would let each MFE
  own its tags, but they are not yet in all stable browsers and Angular Elements does
  not support them; revisit when both change.
- **CSS custom properties** — Angular 22.1+ can namespace component-level CSS
  variables per app (`provideCssVarNamespacing()`), preventing collisions when several
  Angular apps share a page. Global stylesheets are not covered. CSS `@scope` (now in
  all major browsers) is a light-DOM alternative to Shadow DOM for scoping MFE styles.
- **Accessibility across shadow roots** — `<label for>` / `aria-labelledby` can't
  cross shadow boundaries except via _Reference Target_, currently Chromium-only.
  Prefer self-contained labelling inside each MFE.
- **`APP_ID` and transfer state** — each Angular app on a page needs a unique
  `APP_ID`, especially if SSR fragments are ever spliced into one document.

## Validation status

- ✅ **Boundary and isolation** — [`isolation-demo/`](./isolation-demo/): three
  independent Angular runtimes coexist on one page with isolated state.
- ✅ **Isolated runtime + platform contract** — [`poc-isolated/`](./poc-isolated/):
  manifest-driven loading with timeout, fallback and SRI; a 1 kB-gzip platform SDK
  loaded once; context, token provider and event bus working across Angular 21 and
  22; URL-sync routing with deep links and back/forward; local-dev manifest override.
- ✅ **Shared runtime** — [`poc-shared/`](./poc-shared/): `@angular/core` loads once for
  host and aligned MFEs, while an MFE a major behind runs on its own Angular in a
  separate import-map scope.
- ✅ **Fragment SSR** — [`poc-ssr/`](./poc-ssr/): both host styles server-render MFE
  fragments (including one a major behind) and hand over to the client with no
  hydration errors, CLS 0, and client-side fallback on timeout.
- **Open questions:**
  - Byte and load-time break-even with representative, feature-rich MFEs (the
    measured comparison used minimal MFEs).
  - Shared runtime with MFEs more than one major behind: current Native Federation
    supports Angular 20+; older remotes need the previous NF line.

## Builder / module-system stance

Modern ESM throughout; **no CommonJS, no webpack requirement.** Angular's
esbuild-based builder for every app (Angular 22.1+ also uses Rolldown for chunk
optimization and OXC in production optimization). Module Federation 2.0 → Rspack is
fast but reaches Angular only through experimental, third-party tooling. **Angular
22** is the target baseline (zoneless by default, which lowers the per-runtime cost),
on TypeScript 6.0 — Angular does not yet support TypeScript 7.
