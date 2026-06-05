# Recommendation

For the scenario this research targets: **Angular MFEs reused as features across
multiple host applications, where hosts may sit on different framework versions and
teams ship on independent schedules.** Adjust if your version constraints differ —
the decision gate below makes the dependency explicit.

## Decision gate

> **Can every host that embeds an MFE be held to a compatible Angular version?**

- **Yes, reliably** → use **Native Federation** (Angular-native, esbuild/ESM,
  SSR-ready) or **Module Federation 2.0 on Rspack** (faster CI, typed contracts).
  One shared runtime per page; richer integration. Stop here.
- **No / not reliably** → continue. The reusable-ingredient requirement is a
  **version-independence** requirement, and only a self-contained boundary
  satisfies it.

## The recommendation (version-independence case)

1. **Make every MFE a custom element (Angular Elements) by default.** The
   web-component boundary is the **stable integration contract** for _all_ MFEs,
   version-matched or not. Uniform: every host mounts every MFE the same way.

2. **Share the Angular runtime when versions align; fall back to a private copy
   when they don't.** Runtime sharing is a _build-config optimization_, never a
   change to the integration code. Consequence: a team that lags on Angular
   **retrofits nothing** — it was already a web component; it simply stops sharing
   the runtime until it catches up.

3. **Compose flat: host → list of MFEs.** The host is a thin shell (routing,
   layout, auth/session, loading the shared component library once). MFEs are
   siblings, never nested in each other. Cap any cross-cutting MFE-in-MFE case at
   one level and require explicit sign-off; arbitrary nesting builds a distributed
   monolith.

4. **Define an MFE as one domain.** Coarse-grained, domain-level MFEs keep
   per-page count low (target **1–2 typical, ~5 maximum**), which is what keeps the
   duplication cost inside budget.

5. **Share large dependencies the same align-or-fall-back way**, and prefer a
   **framework-agnostic shared component library** loaded once at the host so it
   never duplicates per MFE.

6. **Adopt a version _policy_, not version _lockstep_.** e.g. "host and MFEs stay
   within one Angular major," with a rare, explicitly signed-off exception of up to
   **three** distinct versions on a page. This bounds the duplication window to two
   runtimes transiently — three in the exceptional case (~106 KB gzip, still in
   budget; see [`performance.md`](./performance.md)) — without forcing synchronized
   upgrades.

## Host architecture

A common confusion: _what is the host built with in the web-component model — still
federation, or just Angular?_ The host's job is decoupled from how each MFE is built.
It does three things: **know each MFE's bundle URL** (a manifest/registry), **load
the script** at runtime, and **render the custom element** (with
`CUSTOM_ELEMENTS_SCHEMA` so Angular accepts the unknown tag; pass data via
property/attribute bindings, receive DOM events). So there are two host flavors, and
the choice is purely about whether you want runtime sharing:

### Flavor 1 — pure isolation: regular Angular, no federation

A normal Angular app plus a small **loader service** that injects the MFE's
`<script type="module">` and a **manifest** of element-name → URL. No federation,
no special builder. Federation exists to _share dependencies_; if every MFE is fully
self-contained there is nothing to share, so federation would only be an elaborate
script loader. Simplest possible host — at the cost of always-duplicated runtimes.

### Flavor 2 — share-when-aligned (recommended): regular Angular + Native Federation

Here Native Federation earns its place in the host, but its role shifts from
"expose Angular components" to being the **import-map + dependency-sharing + loading
layer**. When an MFE's Angular version matches what the page already loaded, NF lets
it **reuse** that runtime; when it doesn't, the MFE falls back to its **own** copy.
The MFEs are still packaged as web components — NF is just the transport/sharing
machinery that turns "always duplicate" into "duplicate only on version skew" (the
[`comparison-matrix.md`](./comparison-matrix.md) "WebComponents + Federation" row).

> It is **not** either/or: the recommended host is _regular Angular **plus** Native
> Federation as the loader/sharing layer_, with web-component MFEs. They compose.

In both flavors the host stays **thin**: routing, layout, auth/session, and loading
the shared component library once. Note that [`isolation-demo/`](./isolation-demo/)
deliberately uses the _minimum_ host — a static HTML page with `<script>` tags — to
prove the boundary and runtime isolation without the loading/sharing machinery; it is
not a realistic host. A `poc/` is planned to show Flavor 2 end-to-end.

## Self-contained vs share-when-aligned — and why you can defer it

The **boundary** decision (web component for every MFE) is settled and irreversible-by-
design. The remaining choice — _pure self-contained_ (Flavor 1) vs _share-when-aligned
hybrid_ (Flavor 2) — is a **reversible optimization you can defer**, because the
boundary is identical either way: switching is a host-side + build-config change, never
an MFE rewrite.

Given a realistic envelope of **1–2 MFEs per page** (≈70 KB framework) and only ~5 at
the busiest (≈175 KB, still within the aggressive budget), **start pure self-contained
(Flavor 1)**:

- It is the simplest thing, satisfies "one solution, no variants", and needs no
  federation in the host.
- The duplication cost is comfortably in budget for the typical page, and the
  [mobile Lighthouse run](./performance.md) (95/100, 0 ms TBT, three runtimes) shows
  multi-runtime overhead is not the bottleneck.

**Add the share-when-aligned hybrid (Flavor 2) only when a real ~5-MFE page shows a
measurable problem.** Because the boundary doesn't change, this is a non-breaking
upgrade: introduce Native Federation as the host's import-map/sharing layer and the
already-shipped web components start sharing a runtime when versions align. Don't pay
the hybrid's complexity up front for a cost you may never incur.

## Repo topology & delivery

- **Polyrepo fits this model.** One repo (or set) per domain team matches Conway's law,
  the runtime-remote independence goal, and the existing reality of many per-domain
  repos. Independent _deployability_ comes from runtime composition, not the repo
  layout — so polyrepo adds team autonomy without costing independence.
- **Make polyrepo scale with shared scaffolding**, since the cost of polyrepo is drift:
  a shared **MFE starter/template** (build config, element-wrapping boilerplate), a
  **published shared component library** (versioned, web-component-based, consumed like
  any dependency), and a **central manifest/registry** the host reads to discover MFE
  URLs. Per-repo **Nx** is still useful for caching/affected builds — Nx is not
  monorepo-only.
- **Delivery: runtime remotes from a CDN.** Hosts load MFEs live from a manifest of
  immutable, versioned bundle URLs served at the **edge (CDN)** — fast first byte,
  strong caching, and (with share-when-aligned) shared runtime chunks cache once across
  hosts. Immutable versioned URLs also give safe rollbacks and deterministic deploys.

## Why this satisfies competing pressures at once

- **"One clear solution, no variants"** — a single uniform boundary (web component)
  for every MFE. The multi-variant trap is mixing raw federation for some and
  wrappers for others; this avoids it.
- **"Can't force lockstep upgrades"** — solved: laggards never block a host upgrade
  and never require rework.
- **Reuse across hosts on different versions** — the one model where a single MFE
  build runs unchanged everywhere.

## Costs accepted (state these explicitly to stakeholders)

- **Duplicated runtime during version skew** — bounded to ~35 KB gzip per extra
  live Angular major, transient, self-healing.
- **SSR is hard** on this path — treat it as a later, scoped enhancement (or a
  shared-singleton sub-case), not a foundational assumption.
- **DOM-contract interop** — attributes/properties + events, not shared Angular DI.
  Fine for coarse, mostly-self-contained domain MFEs; plan a thin shared
  event/context mechanism for cross-MFE needs (auth, theming).

## Validation status

- ✅ **Technically validated** — see [`isolation-demo/`](./isolation-demo/): three independent,
  separately-versioned Angular runtimes coexist on one page with isolated state and
  working interactivity; per-MFE framework floor ~35 KB gzip; three-runtime page scores
  **95/100 on throttled mobile** (0 ms TBT).
- ✅ **Constraints confirmed:** web-component **boundary is locked in**; **1–2 MFEs/page**
  typical (≤5); version skew capped at **one major** (rarely up to three); delivery is
  **runtime remotes from a CDN**; SSR is a stretch goal, not a requirement.
- 🟡 **Still open:**
  - **Self-contained now, or hybrid from day one?** (recommend self-contained first.)
  - CDN + **manifest/registry** infrastructure and the polyrepo **shared starter**.
  - A `poc/` showing the realistic host end-to-end.
  - If SSR ever becomes a requirement, re-open the decision gate toward the
    shared-singleton path.

## Builder / module-system stance

Modern ESM throughout; **no CommonJS, no webpack requirement.** Native Federation →
esbuild; Module Federation 2.0 → Rspack. Either keeps builds fast for CI. Angular 22
is the target baseline (zoneless by default, which also lowers the per-runtime cost).
