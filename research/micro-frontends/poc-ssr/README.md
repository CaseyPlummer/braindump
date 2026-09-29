# POC: fragment SSR for web-component MFEs

A runnable proof-of-concept for the **fragment SSR without cross-boundary hydration**
technique in the [Server-side rendering section of the recommendation](../recommendation.md#server-side-rendering).
Angular cannot server-render a custom element's content into shadow DOM or hydrate
server-rendered web-component markup (angular/angular #48746, #52275, both open), so
each MFE renders **itself** on the server, the host **splices** that HTML into the
element, and the element **takes over** in the browser.

The same MFEs run under both host styles from the other POCs:

- **Isolated-runtime takeover** (`host`, port 8140): the browser loads each MFE's own
  bundle, as in [`../poc-isolated/`](../poc-isolated/).
- **Shared-runtime takeover** (`host-shared`, port 8141): the browser loads each MFE as
  a Native Federation remote on a shared Angular runtime, as in
  [`../poc-shared/`](../poc-shared/).

Each host composes `<mfe-orders>` (Angular 22.2) and `<mfe-orders-ng21>` (Angular 21.2,
one major behind), both with their own fragment endpoint.

| Workspace | Angular | SSR / server                                                   | Federation                                                                              |
| --------- | ------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `./`      | 22.2.0  | `@angular/ssr` + `@angular/platform-server` 22.2.0, Express 5  | `@angular-architects/native-federation` 22.2.1, orchestrator 4.6.1                      |
| `./ng21/` | 21.2.24 | `@angular/ssr` + `@angular/platform-server` 21.2.24, Express 5 | `@angular-architects/native-federation-v4` 21.2.14 → `@softarc/native-federation` 4.7.0 |

TypeScript 6.0.3 (root) and 5.9.3 (`ng21/`). The v22 CLI requires Node
`^22.22.3 || ^24.15.0 || >=26.0.0`.

## How it works

```
browser ──GET /?customer=Globex──▶ host (Angular SSR, Express)
                                     │  renders the shell; for each <mfe-*> the
                                     │  MfeFragment directive fetches, in parallel,
                                     │  with a 300 ms budget:
                                     ├──▶ :8150/fragment?customer=Globex  (mfe-orders, Angular 22)
                                     └──▶ :8151/fragment?customer=Globex  (mfe-orders-ng21, Angular 21)
                                     │  and places the returned HTML inside the element
browser ◀── HTML: <mfe-orders data-fragment="ssr"><style>…</style><section>…</section></mfe-orders>
   1. paints the server markup immediately (no JS needed)
   2. hydrates the host shell (provideClientHydration)
   3. afterNextRender → defines each element (script tag or loadRemoteModule)
   4. the element upgrades: Angular Elements creates the component on it, clearing
      the server children and rendering the same markup client-side
```

1. **Fragment endpoint per MFE.** `renderOrdersFragment()` (`main.server.ts`) bootstraps
   the MFE's component with `renderApplication`, sets inputs with
   `ComponentRef.setInput`, and returns the component's `<style>` plus its rendered
   children as light DOM with emulated encapsulation. It uses a unique `APP_ID`
   (`mfe-orders`, `mfe-orders-ng21`), no hydration and no transfer state. `server.ts`
   serves it at `GET /fragment?customer=…`.
2. **Host splicing.** The host template binds the element as usual and adds
   `[mfeFragment]="{ customer: customer() }"`. On the server only, the directive
   fetches the fragment under `PendingTasks` (SSR waits for it) with
   `AbortSignal.timeout(FRAGMENT_TIMEOUT_MS)` and sets it as the element's
   `innerHTML`. It records the outcome as `data-fragment="ssr|timeout|error|off"`.
   Fragment URLs and the timeout live in the host's Express server and reach Angular
   through `REQUEST_CONTEXT`; the browser never sees them.
3. **Takeover.** The MFE's browser application does not enable hydration, so when
   Angular Elements creates the component on the existing element it clears the
   element's children and renders fresh. The server markup and the client render
   are identical, so the swap is invisible (same 193.5 px box before and after).

## What it proves (verified in headless Chromium)

- **Server HTML contains the MFE content.** `curl http://localhost:8140/?customer=Globex`
  returns, inside the host's `<main>`:

  ```html
  <mfe-orders data-fragment="ssr"
    ><style ng-app-id="mfe-orders">
      .mfe[_ngcontent-mfe-orders-c796289233]{…}
    </style>
    <section
      _ngcontent-mfe-orders-c796289233=""
      class="mfe"
      data-rendered="server"
    >
      <h3 …>Orders for Globex</h3>
      <p …>Angular 22.2.0 · three most recent orders</p>
      …
      <mfe-orders-ng21 data-fragment="ssr"
        ><style ng-app-id="mfe-orders-ng21">
          …
        </style>
        <section … data-rendered="server">
          <h3 …>Orders for Globex</h3>
          <p …>Angular 21.2.24 · …</p>
          …
        </section></mfe-orders-ng21
      >
    </section></mfe-orders
  >
  ```

  The Shared host (8141) returns the same fragments. Fragments add about 1.7 to
  1.9 kB each to the HTML (7.6 kB versus 3.9 kB without).

- **Host hydration tolerates server-spliced children, with no `ngSkipHydration`.**
  Development builds of both hosts log
  `Angular hydrated 1 component(s) and 24 node(s), 0 component(s) were skipped` and
  no NG05xx errors or warnings. Production builds log nothing at all. Angular only
  walks nodes that belong to a view; the element's children are not in any view, so
  they are never visited. See [ngSkipHydration](#ngskiphydration) for when this stops
  holding.
- **Takeover works on both hosts and both versions.** After load, every
  `section.mfe` reports `data-rendered="client"` and shows the version it runs on
  (`Angular 22.2.0`, `Angular 21.2.24`). The Shared host downloads one shared
  `_angular_core` for the host and `mfe-orders`, plus a separate
  `mfe-orders-ng21/_angular_core` for the Angular 21 remote.
- **Typed DOM contract both ways.** Typing `Initech` in the host input re-renders
  both elements (`Orders for Initech`); clicking `#1001` in `<mfe-orders>` and
  `#2002` in `<mfe-orders-ng21>` updates the host's "Last selected order". Verified
  on both hosts, production builds.
- **No layout shift at takeover; the MFE paints with the document.** See
  [Measured](#measured): CLS 0 with fragments versus 0.30 client-only, and the MFE
  heading paints at about 250 ms instead of 2.5 s (Isolated) or 6 to 9 s
  (Shared) on a throttled mobile profile.
- **Timeout and error fallback.** With `?delay=500` (fragment servers answer after
  500 ms, above the 300 ms budget) both hosts respond in about 310 to 475 ms with
  empty `<mfe-orders data-fragment="timeout"></mfe-orders>` elements, which then
  render client-side. With the Angular 21 fragment server stopped, the host logs
  `fragment <mfe-orders-ng21> error in 11 ms`, serves `mfe-orders` from its fragment
  and `mfe-orders-ng21` empty, and both end up client-rendered. No console errors in
  either case.
- **A failed bundle leaves readable content.** With the MFE bundles blocked, the
  server fragments stay in place after host hydration (content visible, not
  interactive).

## ngSkipHydration

Verified on development builds of the Isolated host:

| Variant                                                                                                   | Result                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **As shipped:** element has no host-rendered children, no `ngSkipHydration`                               | Hydrates cleanly (`0 component(s) were skipped`). Fragments survive until the element upgrades.                                                                                                                                                                                                          |
| `ngSkipHydration` on the custom element itself                                                            | `NG0504: The ngSkipHydration flag is applied on a node that doesn't act as a component host.` Hydration aborts, so the host never finishes bootstrapping and the elements never take over.                                                                                                               |
| Host projects its own content into the element (`<mfe-orders><span>{{ customer() }}</span></mfe-orders>`) | `NG0500: During hydration Angular expected <span> but found <style>.` The splice replaced the host-rendered child. Bootstrap aborts.                                                                                                                                                                     |
| Same, wrapped in a component host with `ngSkipHydration`                                                  | No errors (`1 component(s) were skipped`), contract works. But a skipped component is re-rendered on the client, so the host **discards the fragment at bootstrap**: the element collapses from 193.5 px to 22.5 px until its bundle loads, which reintroduces the shift the technique exists to remove. |

So: **`ngSkipHydration` is neither needed nor useful** for this technique. The rule
that makes it unnecessary is simple: the host must not render its own children
inside an MFE element (pass data through inputs, not projected content), and the
fragment must go directly inside the element.

## Measured

Production builds. Browser metrics use Playwright's Chromium at 412×823, 4× CPU
throttling, 150 ms RTT, 1.6 Mbps down, cache disabled, median of 5 loads.
"MFE heading first paint" is the earliest Element Timing entry for each MFE's
`<h3 elementtiming="mfe-heading">`, server-rendered or client-rendered.

| Host           | Fragments | CLS   | FCP    | LCP ¹  | MFE heading first paint (orders / ng21) | Both elements taken over |
| -------------- | --------- | ----- | ------ | ------ | --------------------------------------- | ------------------------ |
| Isolated | on        | 0 ²   | 248 ms | 248 ms | 248 / 260 ms                            | 2,564 ms                 |
| Isolated | off       | 0.303 | 232 ms | 232 ms | 2,520 / 2,484 ms                        | 2,514 ms                 |
| Shared      | on        | 0 ²   | 252 ms | 252 ms | 252 / 252 ms                            | 8,828 ms                 |
| Shared      | off       | 0.296 | 236 ms | 236 ms | 6,068 / 8,848 ms                        | 8,844 ms                 |

¹ The LCP element is a host paragraph (header or footer) in every configuration, so
LCP does not move here. On a page where the MFE is the main content, the MFE heading
column shows when that content paints, and so what LCP would do.
² Some runs (at most 2 of 5 per configuration) showed 0.017, recorded at first paint (about 275 ms) with
the host header and controls as sources: progressive parsing of the throttled HTML
stream, not the takeover. No shift was ever recorded at takeover.

Without fragments, the two elements render into empty boxes and push the host
content below them down (shifts of about 0.105 and 0.19). With fragments the boxes
are the right size from the first paint.

**Lighthouse 13.5.0, mobile preset** (simulated throttling), median of 3:

| Host           | Fragments | Score | CLS   | TBT   | FCP    | LCP (simulated) |
| -------------- | --------- | ----- | ----- | ----- | ------ | --------------- |
| Isolated | on        | 0.91  | 0     | 7 ms  | 2.29 s | 3.07 s          |
| Isolated | off       | 0.83  | 0.176 | 6 ms  | 2.29 s | 3.07 s          |
| Shared      | on        | 0.98  | 0     | 98 ms | 1.50 s | 1.96 s          |
| Shared      | off       | 0.72  | 0.186 | 96 ms | 1.50 s | 5.10 s          |

The score difference within each host comes from CLS. Lighthouse's _observed_ LCP
equals FCP (about 130 ms, host text) in all twelve runs, so the simulated LCP gap on
the Shared host is an artefact of how the simulator attributes network requests,
not a measured MFE paint. Compare on/off within one host, not across hosts.

**Server cost** (warm, local, median of 20 requests):

| Host           | TTFB, fragments off | TTFB, fragments on | Each fragment endpoint |
| -------------- | ------------------- | ------------------ | ---------------------- |
| Isolated | 4.4 ms              | 39.1 ms            | ~27 ms                 |
| Shared      | 3.9 ms              | 29.3 ms            | ~28 ms                 |

The two fragments are fetched in parallel, so the page pays the slowest one, capped
by the timeout. Each fragment request runs a full `renderApplication` (new platform,
new document) in the MFE's server.

**Browser download** (kB = 1,000 bytes, gzip level 9, whole page):

| Host           | Host shell + runtime | `mfe-orders`    | `mfe-orders-ng21` | Total              |
| -------------- | -------------------- | --------------- | ----------------- | ------------------ |
| Isolated | 156.1 / 53.2 kB      | 120.6 / 40.2 kB | 116.5 / 38.8 kB   | 393.3 / 132.2 kB   |
| Shared      | 678.7 / 229.1 kB     | 12.9 / 4.1 kB   | 529.6 / 178.3 kB  | 1,221.2 / 411.6 kB |

(raw / gzip). Fragment SSR adds no browser JavaScript; the Isolated host
shell is about 50 kB raw larger than the CSR host in [`../poc-isolated/`](../poc-isolated/) because it
includes hydration and event replay.

## Shared host and Native Federation SSR

The Shared host works because its **server never loads federated code**. The NF
builder runs with `ssr` unset, which applies federation externals only to the
browser build; the server bundle is an ordinary self-contained Angular SSR build.
MFE HTML reaches the server over HTTP, so nothing on the server needs the shared
runtime.

Native Federation's own SSR mode (`"ssr": true` on the NF build target, launched
with `node --import @angular-architects/native-federation/node-preload`) externalizes
`@angular/*` in the server bundle so remote code can be loaded server-side. With
this workspace (NF 22.2.1, `autoShareScope({ level: 'major' })`, Node 24.16) it does
not start:

- **Without the preload:** the server exits at startup with
  `Error: The injectable 'PlatformLocation' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.`
  (the externalized `@angular/common` is loaded from `node_modules` unlinked).
- **With the preload** (also with an empty `federation.manifest.json`):
  `[native-federation] initNodeFederation failed; SSR will render without federated remotes: Cannot convert undefined or null to object`,
  then the process exits with
  `SyntaxError: The requested module 'rxjs' does not provide an export named 'BehaviorSubject'`.

Fragment SSR does not need that mode, so it is not used here. It would matter only
for server-side composition of federated Angular components, which is exactly the
cross-boundary rendering this technique avoids.

## Architecture

```
projects/
  shell/                  shared by both hosts
    app.ts|html|css         host shell: <mfe-orders> + <mfe-orders-ng21>, input down, event up
    mfe-fragment.directive.ts  server-only: fetch fragment (timeout) → element innerHTML
    element-loader.ts       ElementLoader abstraction + HOST_INFO token
    fragment-context.ts     per-request config passed via REQUEST_CONTEXT
    host-server.ts          Express + AngularNodeAppEngine, env config, static assets
  host/                   Isolated-runtime takeover host (Angular SSR, :8140)
    src/app/script-element-loader.ts   <script type=module src=mfes/<tag>.js>
  host-shared/         Shared-runtime takeover host (Angular SSR + NF in the browser, :8141)
    src/app/federation-element-loader.ts  loadRemoteModule(tag, './web-component')
    federation.config.mjs, public/federation.manifest.json
  mfe-orders/             Angular 22 MFE, one source, three outputs
    src/app/orders.ts       the component (contract: customer in, orderSelected out)
    src/main.ts             browser: self-contained <mfe-orders> element
    src/main.server.ts      server: renderOrdersFragment(inputs) → HTML fragment
    src/server.ts           fragment endpoint (:8150)
    src/web-component.ts    NF exposed module (register()), built by "mfe-orders-federated"
ng21/                     separate Angular 21 workspace (own package.json and lockfile)
  projects/mfe-orders-ng21/  same three outputs, tag <mfe-orders-ng21>, fragment endpoint :8151
assemble.mjs              copies MFE browser builds under each host's dist (mirrors a CDN)
start.mjs                 starts all four servers
```

Build targets: `mfe-orders` (browser element + fragment server), `mfe-orders-federated`
(NF remote), `host`, `host-shared`; in `ng21/`, `mfe-orders-ng21` and
`mfe-orders-ng21-federated`.

## Run it

```bash
npm install          # also installs ng21/ (postinstall)
npm run build        # all MFE builds, both hosts, then assemble
npm start            # all four servers; Ctrl+C stops them
```

| Port | Server                                           |
| ---- | ------------------------------------------------ |
| 8140 | Isolated-runtime takeover host                     |
| 8141 | Shared-runtime takeover host                          |
| 8150 | `mfe-orders` fragment endpoint (Angular 22)      |
| 8151 | `mfe-orders-ng21` fragment endpoint (Angular 21) |

Open `http://localhost:8140/` or `http://localhost:8141/`. Page query parameters:

- `customer=<name>`: initial host input, forwarded to the fragments.
- `fragments=off`: skip fragment fetching (client-only baseline).
- `delay=<ms>`: ask fragment servers to answer late, to exercise the timeout.

Environment variables for the hosts: `FRAGMENT_TIMEOUT_MS` (default 300),
`FRAGMENT_ORDERS_URL`, `FRAGMENT_ORDERS_NG21_URL`. `node start.mjs host mfe-orders`
starts a subset (for example, to leave a fragment server down).
`npm run build:dev` builds the hosts and federated remotes in development mode, which
turns on Angular's hydration diagnostics in the console.

## Gotchas

- **Give every MFE a unique `APP_ID`, on server and browser.** Angular's component
  ID is a hash of the component's structure, not its styles or template text: the
  Angular 22 and Angular 21 copies of the orders component both hash to
  `c796289233`. With the default `APP_ID` (`ng`) their server-rendered style rules
  would both target `_ngcontent-ng-c796289233` and override each other (solid versus
  dashed border here). A unique `APP_ID` prefixes the attribute
  (`_ngcontent-mfe-orders-c…`) and tags the style elements (`ng-app-id`).
- **Never put `ngSkipHydration` on the custom element, and keep host-rendered
  children out of it.** Either one aborts host hydration (NG0504, NG0500); see
  [ngSkipHydration](#ngskiphydration).
- **The MFE's browser application must not enable hydration.** The takeover relies on
  Angular Elements clearing the element's children when it creates the component.
  Hydration would switch that off (`PRESERVE_HOST_CONTENT`) and try to reuse markup
  that no view on the client produced.
- **Guard `app.listen` in SSR entries.** The Angular builder imports `server.ts`
  during the build to extract routes; without `isMainModule(import.meta.url)` the
  build starts the server.
- **An SSR build needs an `index` file**, even for an MFE whose browser output is a
  single element bundle (`The "index" option cannot be set to false when enabling "ssr"`).
- **`AngularNodeAppEngine` rejects unknown `Host` headers** (`Header "host" with value
"localhost:8140" is not allowed`) unless the host is in `allowedHosts`.
- **Native Federation development builds need `dev: true`** on the NF build target's
  development configuration; otherwise the unoptimized host runs against
  production-built shared externals and fails with
  `ReferenceError: ngDevMode is not defined`.
- **Clear the NF externals cache when switching between production and `dev: true`
  builds.** Reusing externals cached by the other mode crashed the build with
  `FATAL ERROR: v8::ToLocalChecked Empty MaybeLocal` (Node 24.16). `npm run build` and
  `npm run build:dev` run `clean:nf-cache` first.

## Limitations

- **Double render.** Every MFE renders twice per page view: once on its server,
  once in the browser. Server CPU scales with page views times MFEs.
- **Data is fetched twice.** There is no transfer state across the boundary, so an MFE
  that loads data does it in its fragment endpoint and again in the browser. A
  shared HTTP cache or passing the data as an input would be needed to avoid it.
- **Per-request fan-out.** Each page request waits for the slowest fragment, up to the
  timeout (here +25 to 35 ms warm, locally). A slow MFE costs every page that embeds
  it until it times out; fragments are not cached.
- **Pre-takeover interaction is lost.** A click on a server-rendered MFE button before
  its bundle has loaded does nothing and is not replayed (the host's event replay
  only covers the host's own listeners). Verified: the click leaves "Last selected
  order" unchanged after takeover.
- **Light DOM only.** Shadow DOM is not used. Declarative shadow DOM
  (`<template shadowrootmode>`) would carry the fragment into a shadow root, but
  Angular's `ShadowDom` encapsulation does not server-render that today.
- **Inputs must be known to the server.** Fragment inputs come from the host's state
  at render time (here, `?customer=`). Inputs that only exist in the browser
  cannot be server-rendered.
- **`:host` styles do not match on the server.** The fragment is rendered under a
  stand-in `<app-orders>` root, so rules on the component host are not applied to
  the `<mfe-orders>` element until takeover.
- **The host trusts fragment HTML.** It is inserted without sanitization, like the
  MFE's own JavaScript bundle; fragment endpoints belong inside the same trust
  boundary.
- **Local measurements.** One machine, localhost, simulated mobile throttling; the
  numbers show direction and rough size, not production latencies.

## How it relates to the other POCs

- [`../poc-isolated/`](../poc-isolated/) (Isolated host) and [`../poc-shared/`](../poc-shared/)
  (Shared host) are client-rendered. This POC keeps their MFE contract and both
  loading styles, and adds server-rendered first paint in front of them. The
  Isolated host here renders every element immediately rather than behind an
  `@if (loaded)` placeholder, so the server markup has somewhere to go.
- The Angular 21 MFE mirrors `poc-shared/ng21/`: fragment SSR works across majors
  because each MFE renders itself with its own Angular on its own server.
- [`../isolation-demo/`](../isolation-demo/) shows the boundary itself; none of it
  changes here.
