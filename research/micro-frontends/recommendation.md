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
   per-page count low (1–3), which is what keeps the duplication cost inside budget.

5. **Share large dependencies the same align-or-fall-back way**, and prefer a
   **framework-agnostic shared component library** loaded once at the host so it
   never duplicates per MFE.

6. **Adopt a version _policy_, not version _lockstep_.** e.g. "host and MFEs stay
   within one Angular major." This bounds the duplication window to two runtimes
   transiently (see [`performance.md`](./performance.md)) without forcing
   synchronized upgrades.

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

- ✅ **Technically validated** — see [`example/`](./example/): three independent,
  separately-versioned Angular runtimes coexist on one page with isolated state and
  working interactivity; per-MFE framework floor measured at ~35 KB gzip.
- 🟡 **Open before committing org-wide:**
  - Confirm realistic **MFEs-per-page** (the number that decides budget headroom).
  - Confirm the achievable **version-skew ceiling** (one major vs more).
  - Decide **delivery**: runtime remotes vs published pinned artifacts.
  - If SSR is in fact required, re-open the decision gate — it favors the
    shared-singleton path.

## Builder / module-system stance

Modern ESM throughout; **no CommonJS, no webpack requirement.** Native Federation →
esbuild; Module Federation 2.0 → Rspack. Either keeps builds fast for CI. Angular 22
is the target baseline (zoneless by default, which also lowers the per-runtime cost).
