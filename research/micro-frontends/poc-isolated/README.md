# POC: Isolated host — self-contained MFEs loaded from a manifest

A runnable proof-of-concept for the **recommended starting architecture**: a real
**Angular host** that discovers and loads **self-contained web-component MFEs at
runtime from a manifest**. Everything is isolated: **no federation, no shared runtime**
(the ["Isolated" host in the host-architecture section](../recommendation.md)).

Where [`../isolation-demo/`](../isolation-demo/) only proves the boundary with a static
HTML page, this shows the **realistic host**: manifest-driven loading, a loader service,
a typed DOM contract (inputs down, events up), and the **cross-cutting concerns usually
attributed to Native Federation** handled without it:

- a framework-agnostic **host services library** (`@platform/sdk`, "the SDK" below) loaded once per page (context protocol, token
  provider, event bus);
- **host-owned URLs** for an MFE with internal routes;
- **typed contracts**: one types-only package per MFE, enforced in the MFE's build
  and the host's;
- **loader resilience** (timeouts, fallback UI, SRI, retry of transient failures);
- a **local-dev manifest override**;
- a **cross-version proof**: an Angular 21 MFE using the same contract as the Angular 22
  host and MFEs.

The argument it tests: module-singleton sharing through federation only works while
versions line up. Once an MFE is a major behind, it gets its own copy of the framework
and its own copy of every shared service, so a framework-agnostic platform contract is
needed anyway. With that contract in place, the Isolated host gives up little.

> Built on **Angular 22.2** (zoneless, esbuild, TypeScript 6.0), plus one MFE on
> **Angular 21.2** in [`ng21/`](ng21/). The v22 CLI requires Node
> `^22.22.3 || ^24.15.0 || >=26.0.0`.

## What it demonstrates

1. **Manifest-driven runtime loading.** The host fetches `mfes/manifest.json`
   (`{ tag, url, integrity?, timeoutMs? }[]`) and injects each MFE's ES-module bundle on
   the fly via `MfeLoaderService`, with no build-time link between host and MFEs. In
   production those URLs point at a **CDN**; here they're served from the host's
   `public/`.
2. **Standard custom-element rendering.** The host template uses `<mfe-orders>`,
   `<mfe-profile>` and `<mfe-cart-ng21>` with `CUSTOM_ELEMENTS_SCHEMA`; nothing tells it
   they're Angular.
3. **Typed DOM contract both directions.**
   - **host → MFE:** `[customer]="…"` flows into `mfe-orders`' signal `input()`.
   - **MFE → host:** `mfe-orders` emits an `output()` (`orderSelected`) that surfaces as
     a DOM `CustomEvent`; the host listens with `(orderSelected)=...` and shows the value.
     The Angular 21 cart does the same with `currency` in and `checkout` out.
   - Each element's inputs and events are published as a **types-only contract
     package**; the MFE and the host both compile against it
     ([below](#typed-contracts)).
4. **Several MFEs composing on one page**, each a separate build with its own runtime,
   across two Angular majors.
5. **Host services library** for session, locale, theme, feature flags, access tokens and app-wide
   events ([below](#host-services-library-platformsdk)).
6. **Routing contract**: the orders MFE has internal routes; the host owns the address
   bar ([below](#routing-contract)).
7. **Resilience** with a retry policy for transient failures, **local-dev
   override**, **cross-version** use of the SDK and of the contracts
   ([below](#loader-resilience)).

## Architecture

```
projects/
  platform-sdk/      @platform/sdk: plain TypeScript, no framework. Built to one ES module
                     and loaded once by the host through an import map.
  platform-angular/  @platform/angular: thin Angular adapter (contexts as signals, token
                     interceptor, host-owned routing). Compiled into each MFE.
  host/              Angular app: shell, context providers, MfeLoaderService, host router
  mfe-orders/        Angular 22: <mfe-orders>, internal routes (list, detail)
  mfe-profile/       Angular 22: <mfe-profile>
ng21/                separate Angular 21 workspace (own package.json)
  projects/mfe-cart-ng21/     <mfe-cart-ng21>: mini-cart on Angular 21
  projects/platform-angular/  the same adapter source, built against Angular 21
contracts/           types-only packages, no framework dependency
  element-contract/  @platform/element-contract: contract shape, typed element events,
                     the host-owned routing convention
  orders/ profile/ cart/      @mfe/orders-contract, @mfe/profile-contract,
                              @mfe/cart-contract: one per MFE
contract-tests/      type-level tests of the contracts and the conformance check
assemble.mjs         publishes SDK + bundles into host/public/, computes SRI hashes,
                     writes manifest.json and the failure-scenario manifests
serve.mjs            static server for the built host + mock API (/api/echo) +
                     simulated outages (?fail=<n>)
sizes.mjs            raw/gzip sizes of everything the page downloads
```

Each MFE is an independent build (separate `ng build` target, or a separate workspace
for `ng21/`). The single repo is for convenience; in production each MFE is its own
repo/pipeline (see the polyrepo guidance in [`../recommendation.md`](../recommendation.md)).

## Run it

```bash
npm run setup          # npm install here and in ng21/

npm run build          # SDK → Angular 22 MFEs → Angular 21 MFE → assemble → host
npm run serve:dist     # http://localhost:8137
npm run test:contracts # contract conformance, both workspaces
npm run sizes          # bundle sizes of the built page
```

`npm run build` = `build:sdk` → `build:mfes` → `build:ng21` → `assemble` (copy SDK and
bundles, hash them, write `projects/host/public/mfes/manifest*.json`) → `ng build host`.

Useful URLs on the served build:

| URL                                                       | Shows                                                          |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| `/`                                                       | Host page; profile (22) and cart (21) MFEs in the side column  |
| `/orders`, `/orders/1002`                                 | Orders MFE list / deep-linked detail route                     |
| `/orders/all`                                             | A redirect inside the MFE; the host replaces the history entry |
| `/?manifest=broken`                                       | SRI mismatch (profile) and 404 (cart): fallbacks, orders fine  |
| `/?manifest=faulty`                                       | Bundle throws (profile) and never registers (cart): fallbacks  |
| `/?manifest=flaky`                                        | 503s: profile recovers on its 2nd retry, cart falls back       |
| `/?mfe-override=mfe-orders=http://localhost:4201/main.js` | Local-dev override ([below](#local-dev-override))              |

The controls at the top switch user, tenant, locale, theme and feature flags; every MFE
updates live. `npm start` serves the host with live reload (`ng serve host`); the mock
API only exists under `serve:dist`.

## Host services library (`@platform/sdk`)

`projects/platform-sdk/` is the whole platform contract, in plain TypeScript:

| Export                                                                                  | Purpose                                                    |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `ContextProvider`, `requestContext`                                                     | Web Components Context Protocol (provider and consumer)    |
| `sessionContext`, `localeContext`, `themeContext`, `featureFlagsContext`, `authContext` | Well-known contexts the host provides                      |
| `bus`, `PlatformEvents`                                                                 | Typed, versioned app-wide events                           |
| `version`, `assertSdkMajor()`                                                           | Semver of the contract; fail-fast major check at bootstrap |

### How it is loaded: import map + external

The host page declares one import map and preloads the SDK:

```html
<script type="importmap">
  { "imports": { "@platform/sdk": "/platform/sdk/1.0.0/sdk.js" } }
</script>
<link rel="modulepreload" href="/platform/sdk/1.0.0/sdk.js" />
```

Every Angular build (host, both Angular 22 MFEs, the Angular 21 MFE) lists
`"externalDependencies": ["@platform/sdk"]`, so esbuild leaves
`import … from "@platform/sdk"` in the output instead of bundling it. For type-checking,
`tsconfig.json` `paths` maps `@platform/sdk` to the SDK source. At runtime the browser
resolves the bare specifier through the host's import map, and the module map
guarantees **one fetch and one evaluation** however many bundles import it.

Why this rather than the alternatives:

- **Import map + external** keeps MFE code as ordinary static ES imports with full
  types, uses only platform features (no loader library, no federation runtime), and
  lets the host pin the exact SDK version in one place.
- **A `window` global** would also work, but gives up static imports, tree-shakable
  typing and the browser's module deduplication, and invites load-order bugs.
- **Bundling the SDK into each MFE** would still _work_ (see next point), but
  duplicates bytes and lets versions drift silently.

The SDK is deliberately **stateless and DOM-based**: context keys are strings, providers
answer duck-typed `context-request` events, and the bus rides on `document` events. Two
copies of the SDK on one page interoperate correctly. Loading it once is an
optimisation and a version-pinning mechanism, **not** a correctness requirement, which is
exactly the property federation's singleton sharing lacks.

The adapter layer (`@platform/angular`) depends on Angular, so it is compiled into each
MFE (2.7 kB raw in orders). It has secondary entry points (`/http`, `/routing`) so an MFE
that doesn't use them doesn't pull in `HttpClient` or the router. `ng21/` holds a
verbatim copy built against Angular 21; `assemble.mjs` fails the build if the copies
diverge. In production this is one package published per supported Angular major.

### Context protocol

A minimal implementation of the
[Web Components Community Group Context Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md),
wire-compatible with `@lit/context`: a consumer dispatches a bubbling, composed
`context-request` event (`context`, `contextTarget`, `callback`, `subscribe`); the
nearest provider answers synchronously and, for subscriptions, calls back on every
change with an `unsubscribe` function.

- **Host:** `PlatformHost.provideTo(element)` attaches a `ContextProvider` per context to
  the host's root element and pushes signal changes into them with `effect()`.
- **MFE:** the element's root component provides `Platform`, which calls
  `injectContext(ctx)` for each well-known context. `injectContext` turns a context into
  a signal and unsubscribes on destroy. Routed children inject `Platform` (their host
  elements aren't connected yet at construction, so they don't dispatch requests
  themselves).

Context keys carry a contract major (`platform.session@1`). A breaking change ships as
`@2`, provided alongside `@1` until every MFE has moved.

### Token provider

`authContext` carries `{ getAccessToken(): Promise<string> }`. MFEs never see refresh
tokens or the identity library. `platformAuthInterceptor` (`@platform/angular/http`)
asks for a fresh token per request and adds `Authorization: Bearer …` **only** for
same-origin `/api/` URLs, so CDN and third-party requests never carry it. The host's
provider is a mock (`mock-at.<user>@<tenant>.<n>`); `serve.mjs` answers
`GET /api/echo` with the Authorization header it received.

### Event bus

For many-to-many communication between MFEs with no parent/child DOM relationship.
Events are named `<domain>.<event>@<major>` and typed through the `PlatformEvents`
interface (domain teams extend it by declaration merging). Payloads are cloned and
frozen, must be JSON-compatible (the same contract could cross an iframe via
`postMessage`), and carry a `source` for diagnostics. A throwing subscriber doesn't stop
the others. In the demo, `mfe-orders` (Angular 22) publishes `cart.itemAdded@1`, and
`mfe-cart-ng21` (Angular 21) consumes it and publishes `cart.itemAdded@1` /
`cart.cleared@1` back; the host logs every event.

## Routing contract

`mfe-orders` uses the Angular router internally (`/` list, `/:id` detail, `/all`
redirect, `**` not-found), while **the host owns the URL**:

| Direction  | Channel                             | Example                                              |
| ---------- | ----------------------------------- | ---------------------------------------------------- |
| host → MFE | `route` input (sub-path)            | browser at `/orders/1002` → `route="/1002"`          |
| host → MFE | `base` attribute (mount path)       | `base="/orders"`, used for generated `href`s         |
| MFE → host | `navigate` event `{path, replace?}` | link to `/1003` clicked → host pushes `/orders/1003` |

The MFE router runs on **`MemoryLocationStrategy`** (`@platform/angular/routing`): it
never reads or writes `window.history` and its `onPopState` never fires. Back/forward is
therefore seen by the host router only, which updates the `route` input; the MFE applies
it as an imperative navigation. `HostRouteSync` suppresses the echo: a `route` input equal
to the router's current URL is a no-op, and a navigation that ends on the host-supplied
route emits no `navigate`. A host-requested URL that redirects inside the MFE emits
`navigate` with `replace: true`, so the host replaces rather than pushes. `href`s come
from `base` + route, so middle-click and copy-link produce real host URLs.

Alternatives rejected:

- **Both routers on the real URL** (MFE with `PathLocationStrategy` and a base href):
  both listen to `popstate`, each history step navigates twice, and the two routers
  race to write the address bar.
- **No router in the MFE, input-driven view switching:** safe, but loses route params,
  guards, resolvers and `routerLink`, so each team reinvents them.

## Typed contracts

Each MFE publishes its element API as a small types-only package, and both sides
compile against it: the MFE proves it implements the contract, and the host gets
typed properties and event payloads. The packages contain no runtime code and
depend on no framework, so the Angular 21 cart uses its contract exactly as the
Angular 22 MFEs use theirs.

| Package                      | Declares                                                                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@platform/element-contract` | `ElementContract` (`tag`, `inputs`, `events`), `ContractElement` (typed `addEventListener`), `ContractEventMap`, `ContractAttributes`, the routing inputs/event |
| `@mfe/orders-contract`       | `mfe-orders`: `customer`, `route`, `base` in; `orderSelected: string`, `navigate: NavigateDetail` out                                                           |
| `@mfe/profile-contract`      | `mfe-profile`: `userId` in; no events                                                                                                                           |
| `@mfe/cart-contract`         | `mfe-cart-ng21`: `currency` in; `checkout: CartCheckoutDetail` out                                                                                              |

Every contract package augments `HTMLElementTagNameMap`
(`'mfe-orders': MfeOrdersElement`), so the tag name alone selects the typed
element: `document.createElement('mfe-orders').customer` is a `string`, and
`addEventListener('orderSelected', e => …)` receives `CustomEvent<string>`. Native
events keep their DOM types; unknown event names fall back to plain `Event`.
Contract events are dispatched on the element by Angular Elements and don't
bubble. In the POC, `tsconfig.json` `paths` map the package names to
`contracts/`; in production each is published with its MFE, versioned by semver.

### Where types are enforced

| Where                    | Mechanism                                                                                                                                   | Catches                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| MFE build                | `AssertConforms<ContractCheck<Component, Contract>>` (`@platform/angular/contract`) over the root component's signal `input()`s/`output()`s | Missing, extra or retyped inputs and events, in either direction                     |
| MFE build                | `customElements.define("mfe-orders" satisfies MfeOrdersContract["tag"], …)`                                                                 | Tag drift                                                                            |
| Host TypeScript          | `HTMLElementTagNameMap` augmentation; handlers typed as `MfeOrdersEventMap["orderSelected"]`                                                | Wrong property types, unknown properties, wrong `detail` use                         |
| Host templates, events   | Angular's type-check block creates the element with `document.createElement(tag)` and types `$event` through its `addEventListener`         | `detail` misuse; a misspelt event name yields `Event`, which a typed handler rejects |
| Host templates, inputs   | One small directive per element (`mfe-bindings.ts`) claiming its inputs with setters typed by the contract                                  | Wrong binding types                                                                  |
| `npm run test:contracts` | `ngc` type-check of both workspaces plus `contract-tests/` (with `@ts-expect-error` cases)                                                  | All of the above, in CI, without bundling                                            |

`ContractCheck` compares key sets and types exactly and names each difference.
Changing `orderSelected` to `{ id: number }` in the contract alone fails the orders
build, the host and the contract tests:

```text
projects/mfe-orders/src/app/shell.ts:143:3 - error TS2344: Type '"mfe-orders: event \"orderSelected\" has a different detail type in the contract"' does not satisfy the constraint '"conforms"'.
projects/host/src/app/pages/orders.page.ts:81:30 - error TS2345: Argument of type '{ id: number; }' is not assignable to parameter of type 'string'.
contract-tests/usage.ts:23:60 - error TS2339: Property 'startsWith' does not exist on type '{ id: number; }'.
```

Adding `compact = input(false)` to the orders component without a contract change
fails the other way:

```text
projects/mfe-orders/src/app/shell.ts:144:3 - error TS2344: Type '"mfe-orders: component input \"compact\" is not in the contract"' does not satisfy the constraint '"conforms"'.
```

Renaming `items` in `@mfe/cart-contract` fails the Angular 21 build (`'items' does
not exist in type 'CartCheckoutDetail'`) and the Angular 22 host
(`Property 'items' does not exist on type 'CartCheckoutDetail'`).

### Limitations of template checking under `CUSTOM_ELEMENTS_SCHEMA`

- **Property bindings aren't type-checked** by Angular on custom elements; the
  schema accepts any of them. The binding directives restore type checking for
  the inputs they declare, but **a misspelt input** (`[custmer]`) still falls back
  to an unchecked DOM property and compiles. The directives are per-element host
  code (short, and `implements` the contract's inputs interface so they can't
  omit one); a generator could emit them from the contract.
- **Event bindings are typed** only with `strictTemplates` (which enables
  `strictDomEventTypes`). A misspelt event name is caught only when the handler
  parameter is typed; `(orderSelectd)="log($event)"` with an untyped handler
  compiles and never fires.
- **Attributes** (`currency="EUR"`) are strings and not checked beyond the
  directive's input type; `ContractAttributes<C>` gives the kebab-case names for
  code that sets attributes.
- **Conformance needs signal APIs.** `ContractCheck` sees public `input()` and
  `output()` members by type; decorator `@Input`s are invisible to it, and an
  `alias` would change the DOM name without the check noticing. Every MFE here
  uses unaliased signal inputs and outputs.
- **Types only.** Nothing checks at runtime that the bundle a manifest points at
  implements the contract version the host was built against. Contract packages
  follow semver: additive changes are minor, and a breaking change needs the host
  and MFE released together, or a new tag served alongside the old one.

## Loader resilience

`MfeLoaderService` loads every manifest entry independently:

- **Time budget** per MFE (`timeoutMs`, default 10 s) until
  `customElements.whenDefined`, covering every attempt and backoff.
- **Fast failure**: the script's `error` event (network error, HTTP error, SRI
  mismatch) and window `error` events whose `filename` is the bundle URL (throws
  during evaluation) settle immediately instead of waiting for the timeout.
- **Retry of transient failures** ([below](#retry-policy)).
- **Fallback UI** per slot (`<app-mfe-fallback>`), with the reason; the other MFEs and
  the host are unaffected.
- **Subresource Integrity**: `assemble.mjs` writes a `sha384-…` `integrity` per bundle;
  the loader sets `script.integrity` (+ `crossOrigin="anonymous"`), and the browser
  refuses a mismatching bundle.
- **Tag collisions**: an entry whose tag is already defined is refused.

### Retry policy

| Failure                                      | Retried | Why                                              |
| -------------------------------------------- | ------- | ------------------------------------------------ |
| Network error, HTTP 5xx, 408, 429            | yes     | Transient: the same request can succeed later    |
| SRI mismatch                                 | no      | Deterministic: the bytes on the server are wrong |
| Other HTTP errors (404, 403, …), non-JS type | no      | Deterministic                                    |
| Bundle throws while evaluating               | no      | Deterministic, and it has already run            |
| Bundle loads but never registers its element | no      | Deterministic; ends at the timeout               |

Up to **2 retries**, with backoff **250 ms then 1 s, ±25 % jitter**, and only while
the MFE's time budget still covers the wait. The failure message records the
reason and attempts, e.g. `failed to load mfes/mfe-cart-ng21.js (HTTP 503, 3
attempts)`.

**Classifying the failure.** A `<script>` `error` event looks the same for a 503,
a 404, a dropped connection and an SRI mismatch. After a failed attempt the loader
fetches the same URL once (`cache: "no-store"`): a network error or a 5xx/408/429
is transient; another HTTP status is not; a 200 whose SHA digest doesn't match the
manifest's `integrity` is an SRI mismatch; a 200 that does match means the fault
has already cleared, so the retry goes ahead. The diagnostic request is made only
after a failure, so a healthy page makes no extra requests.

**Retry URLs.** A module URL that failed stays failed for the document: the
module map caches the failure, and a second `<script>` or `import()` of the same
URL rejects without touching the network (verified in Chromium). Each retry
therefore adds `?mfe-retry=<n>` to the bundle URL, giving it a fresh module-map
entry. The retry is still a `<script type="module">` with the manifest's
`integrity`, so the browser enforces SRI on it as on the first attempt. The
alternative, fetching the bytes and running them from a `blob:` URL, would move
SRI enforcement into application code, need `blob:` in the CSP `script-src`, and
turn stack traces and `import.meta.url` into `blob:` URLs.

`/?manifest=flaky` runs this against `serve.mjs`, which answers the first `n`
requests for a file with `?fail=<n>` with 503 (re-armed on every page load).

## Local-dev override

Point one MFE at a local build while the rest of the page uses the published manifest:

```bash
npx ng serve mfe-orders       # dev server on http://localhost:4201 (profile: 4202;
                              # ng21: npm --prefix ng21 run ng -- serve → 4203)
npm run serve:dist            # host on http://localhost:8137
# open http://localhost:8137/orders?mfe-override=mfe-orders=http://localhost:4201/main.js
```

- `?mfe-override=<tag>=<url>` sets an override, `<tag>=` removes one, `reset` removes
  all. Several `mfe-override` params may be combined.
- Overrides persist in `localStorage` (`mfe-overrides`) and the param is stripped from
  the address bar before the host router starts. A banner shows active overrides with a
  **Clear overrides** button.
- Honoured **only on a loopback host or in a dev build**, and the target URL must itself
  be on `localhost`, `127.0.0.1` or `[::1]`: a crafted link cannot swap a production MFE
  for a remote script.
- Overridden entries drop `integrity` (a local build never matches the published hash).
- The Angular dev server keeps `@platform/sdk` external and sends CORS headers for
  localhost origins, so the dev bundle (with HMR) runs inside the host page against the
  host's SDK and contexts. A static alternative: `node serve.mjs --root
dist/mfe-orders/browser --port 4201`.

## Cross-version proof

`ng21/` is a separate workspace pinned to Angular **21.2.24** (TypeScript 5.9). Its
`<mfe-cart-ng21>` imports the same `@platform/sdk` external and the same adapter source,
and on the same page as the Angular 22 host and MFEs it:

- receives session, locale, theme and flag changes from the host live;
- gets tokens from the host's provider through its own Angular 21 `HttpClient`
  interceptor;
- consumes bus events from the Angular 22 orders MFE and publishes events the orders MFE
  receives.

This is the case where federation's module sharing falls apart: a shared-scope
singleton service would give the Angular 21 MFE a _different_ instance (or none). Here
there is nothing to share at module level; the contract is DOM events plus one
stateless ES module.

## Verified behaviour

Checked with Playwright (Chromium) against `npm run serve:dist`:

- **SDK once:** `sdk.js` appears once in the network log, and
  `globalThis.__platformSdkEvaluations === 1` with four bundles importing it.
- **Contexts across versions:** switching user/tenant, locale (`en-US` → `de-DE`), theme
  and flags updates both Angular 22 MFEs and the Angular 21 MFE (names, `€62.00` →
  hidden totals, `Aug 2, 2026` → `02.08.2026`, `data-theme="dark"`, accent colour,
  recommendation button removed).
- **Token:** `/api/echo` returned `Bearer mock-at.u-42@tenant-a.1` (Angular 22) and
  `Bearer mock-at.u-42@tenant-a.2` (Angular 21); after switching user, the next token
  was `mock-at.u-7@tenant-a.3`.
- **Bus:** orders (22) → cart (21) and cart (21) → orders (22), plus `cart.cleared@1`,
  all reflected in the host's event log.
- **Routing:** deep link `/orders/1002` renders the detail; in-MFE links push
  `/orders/1003`, `/orders`, `/orders/1001`; back ×3 and forward render the matching
  views; host navigation away and back re-mounts the MFE on the right route;
  `/orders/all` is replaced by `/orders` (back skips it). Every step produced exactly
  one `history` write (two for the redirect: push, then replace), all from the host
  router, and at most one MFE router navigation, always
  `navigationTrigger: "imperative"`, never `"popstate"`.
- **Failures:** `?manifest=broken` shows fallbacks within ~80 ms: `integrity mismatch`
  (profile) and `HTTP 404` (cart), each after exactly one script request and one
  diagnostic fetch, no retry. `?manifest=faulty` catches the evaluation error at
  once and the never-registering bundle after its 3 s timeout, one request each, no
  diagnosis, no retry. The orders MFE keeps working in both.
- **Retry:** `?manifest=flaky` produced this request sequence (network log):
  profile `503` (attempt 1), `503` (diagnosis), `?mfe-retry=1` `503`, diagnosis `200`
  with a matching digest, `?mfe-retry=2` `200` after 1.07 s backoff, logged
  `"mfe-profile" loaded on attempt 3` and rendered normally. Cart: three attempts and
  three diagnoses, all `503`, then the fallback `HTTP 503, 3 attempts` about 1.1 s
  in. Orders loaded once, unaffected. A `?mfe-override` pointed at a server that
  wasn't listening yet recovered on retry 1 (`network error`).
- **Module map:** after a 503, a second `<script>` and an `import()` of the same URL
  both failed without a network request; the `?mfe-retry=1` URL was fetched and
  loaded. A retry URL with a wrong `integrity` is still refused.
- **Contracts:** `npm run test:contracts` passes in both workspaces; the deliberate
  breaks in [Typed contracts](#typed-contracts) fail with the errors shown.
  In the browser, the host's typed bindings set `customer`, `route`, `base`,
  `userId` and `currency` on the elements, and the Angular 21 cart's `checkout`
  event reaches the host (`1 item(s), €289.00`, reformatted to `289,00 €` after a
  locale switch).
- **Override:** `ng serve mfe-orders` bundle loads into the host (shows a _dev build_
  badge), persists across reloads, a non-localhost target is rejected, `reset` restores
  the published bundle.
- **Console:** no errors or warnings on normal pages; only the induced ones in the
  failure, flaky and override-rejection scenarios.

## Measured

Production builds, kB = 1,000 bytes, gzip level 9 (`npm run sizes`). Every MFE bundle
still carries its own tree-shaken Angular runtime; only the SDK is shared.

| Bundle                      | Before (raw / gzip) | Now (raw / gzip) | Delta, and why                                                                |
| --------------------------- | ------------------- | ---------------- | ----------------------------------------------------------------------------- |
| `platform/sdk/1.0.0/sdk.js` | —                   | 2.2 / 1.0 kB     | the whole platform contract, loaded once                                      |
| Host `main.js`              | 105.7 / 35.5 kB     | 244.0 / 75.8 kB  | +138 kB raw: host router (77 kB) and its core/common use, loader retry        |
| `mfes/mfe-orders.js`        | 119.1 / 39.5 kB     | 261.1 / 81.1 kB  | +142 kB raw: router (74 kB), `HttpClient` + `Location` (~25 kB), more of core |
| `mfes/mfe-profile.js`       | 108.9 / 36.1 kB     | 121.8 / 40.7 kB  | +12.9 kB raw: adapter (1.0 kB), signals/`computed`, UI                        |
| `mfes/mfe-cart-ng21.js`     | —                   | 155.7 / 51.1 kB  | new: Angular 21 runtime + `HttpClient`                                        |
| **Whole page**              | 333.7 / 111.1 kB    | 784.8 / 249.8 kB | five bundles instead of three                                                 |

The platform contract itself is small: 1.0 kB gzip for the SDK plus 1–3 kB raw of
adapter per MFE. The typed contracts add nothing: they are types only. The real per-MFE cost of isolation is framework features: an MFE that
uses the Angular router pays ~74 kB raw for its own copy. That is what the Shared host
would deduplicate, and only while the MFEs are on the same Angular version.

## How a new MFE joins

1. Add a project that registers a `customElements.define('mfe-x', …)` element (copy
   `mfe-profile`), with `"externalDependencies": ["@platform/sdk"]` and
   `index.preloadInitial: false` in its build options.
2. Provide `Platform` on the root component; add `platformAuthInterceptor` /
   `provideHostOwnedRouting` if it calls the API or has routes. Call
   `assertSdkMajor(1, 'mfe-x')` at module top level.
3. Publish its contract: `contracts/x/` with the inputs, events and the
   `HTMLElementTagNameMap` entry (copy `contracts/profile/`), a `paths` entry in
   each consuming `tsconfig.json`, and
   `AssertConforms<ContractCheck<Root, MfeXContract>>` next to the root component,
   which uses signal `input()`/`output()`.
4. Add it to `remotes` in `assemble.mjs` (in production: publish its bundle to the CDN
   and add a manifest entry with its `integrity`).
5. The host renders it wherever it places `<mfe-x>` (with a binding directive for
   typed inputs); no host redeploy needed once the manifest is fetched at runtime,
   unless the host starts using a new contract version.

## Limitations and open issues

- **Framework features are per MFE.** Router, `HttpClient` and forms are duplicated in
  every isolated MFE that uses them (see [Measured](#measured)). Budget for it, or add
  the Shared host for busy pages.
- **One SDK major per page via a plain import map.** An SDK 2.0 would need import-map
  `scopes` keyed by MFE URL prefix (old MFEs keep 1.x) or a new specifier
  (`@platform/sdk@2`). The contract itself (context keys, event names) is already
  versioned for side-by-side majors.
- **The SDK import isn't covered by SRI.** The manifest's `integrity` covers each MFE
  entry bundle only. Import maps accept an `integrity` section in current browsers,
  which should be stamped at deploy time. `assemble.mjs` refuses MFE builds with lazy
  chunks, since those wouldn't be covered either.
- **Bus events aren't replayed.** A subscriber that mounts later misses earlier events;
  shared state belongs in a host-provided context, not on the bus.
- **Context protocol subset.** No `context-provider` event for late-registering
  providers; consumers must be inside the host element when they connect, and an MFE
  moved to another provider doesn't re-request.
- **Token registry is per application.** Several instances of one element share one
  Angular app injector; the interceptor uses the first connected instance's provider.
- **Retry edges.** Retry URLs (`?mfe-retry=<n>`) are separate CDN cache keys, so a
  retry during an origin outage may miss the edge cache; `Retry-After` isn't
  honoured. A failed diagnostic fetch counts as a network error (transient), so a
  CDN without CORS on bundles is retried to exhaustion rather than failing fast;
  SRI already requires CORS. An element that finally registers after its budget
  ran out keeps showing the fallback until reload. An error thrown by a module the
  entry imports (rather than the entry itself) is only caught by the timeout.
- **Typed contracts are compile-time only**, and host templates check input types
  but not input names ([details](#limitations-of-template-checking-under-custom_elements_schema)).
- **Routing:** the MFE router is application-wide, so its state survives the element
  being removed and re-added (harmless here, since the `route` input re-syncs it). Query
  strings pass through, but fragments don't. Host-level guards can't see the MFE's
  internal routes.
- **Runtime locale:** Angular's `LOCALE_ID` is fixed per application, so runtime
  switching formats with `Intl`; Angular's `DatePipe`/`CurrencyPipe` wouldn't follow the
  context.
- **Styling:** MFEs use emulated encapsulation (no Shadow DOM), themed via CSS custom
  properties; host global styles can still leak in.
- **Dev ergonomics:** the host dev server (`npm start`) has no `/api` proxy; the MFE
  standalone pages (`ng serve mfe-*`) render without a context provider.
- **CLI gotcha:** with `externalDependencies`, the Angular CLI emits
  `<link rel="modulepreload" href="@platform/sdk">`, which bypasses the import map and
  404s. Every project here sets `index.preloadInitial: false`, and the host preloads the
  real SDK URL itself.
