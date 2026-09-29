# Performance: the cost of self-contained runtimes

The central objection to self-contained web-component MFEs is bundle/runtime
duplication. This quantifies it with measured numbers, compares it with sharing the
runtime via Native Federation, and shows why, for coarse-grained MFEs, the cost stays
inside web-performance budgets.

## Measured baseline

Built with the [`isolation-demo/`](./isolation-demo/) project — minimal Angular 22.2,
**zoneless**, esbuild, production (TypeScript 6.0); kB = 1,000 bytes, gzip level 9:

| Artifact                                                       | Raw      | Gzip         |
| -------------------------------------------------------------- | -------- | ------------ |
| One functional Angular Element (framework + trivial component) | 110.5 kB | **36.7 kB**  |
| Three independent runtimes on one page (combined)              | 331.3 kB | **110.0 kB** |

Zoneless (the Angular 21+ default) removes zone.js (~10 KB gzip) and its bootstrap
overhead, so the per-MFE framework floor is **~35–37 KB gzip** — lower than commonly
cited figures from the zone.js era. (Angular 22.0 measured ~35 KB; 22.2 adds ~1–2 KB.) This is the _duplication tax_: what you pay once
per **distinct Angular version live on a page**.

Reference budgets: critical-path JS ~250 KB (aggressive ~200 KB), total page ~1 MB,
Time-to-Interactive < 3 s (< 5 s on 3G/4G).

## Measured: mobile Lighthouse (three runtimes)

The three-runtime page (Angular 22.0 build) run through Lighthouse on its **default
mobile preset** (Moto G4-class CPU + simulated Slow 4G):

| Metric                   | Value        |
| ------------------------ | ------------ |
| Performance score        | **95 / 100** |
| First Contentful Paint   | 2.4 s        |
| Largest Contentful Paint | 2.4 s        |
| Total Blocking Time      | **0 ms**     |
| Speed Index              | 2.4 s        |
| Cumulative Layout Shift  | 0            |
| Time to Interactive      | 2.4 s        |

Even with **three independent Angular runtimes**, blocking time is **0 ms** — the
multi-runtime bootstrap does not jam the main thread (zoneless helps). LCP sits right
at the 2.5 s "good" threshold and is dominated by **Slow-4G transfer** of the ~106 KB
gzip, not CPU. Caveat: this is framework overhead only; real feature code, images, and
data fetching would add to LCP/TBT — but it confirms the _duplication itself_ is not
the bottleneck.

## Isolated vs Shared: measured page weight

The same three-app page (host + two MFEs, all on Angular 22.2) built both ways —
[`poc-isolated/`](./poc-isolated/) (self-contained) and [`poc-shared/`](./poc-shared/) (shared via
Native Federation). kB = 1,000 bytes, gzip level 9.

| Page                                            | Isolated            | Shared                           |
| ----------------------------------------------- | ------------------------- | ----------------------------------- |
| Host shell                                      | 35.5 kB                   | 227.5 kB (incl. shared Angular, orchestrator, shims) |
| Each aligned MFE                                | ~36–40 kB                 | ~2 kB                               |
| Host + 2 aligned MFEs                           | **111.1 kB**              | **~231 kB**                         |
| + 1 MFE a major behind                          | ~+37 kB                   | **+177.2 kB** (408.3 kB total)      |

**Why Shared is heavier at small MFE counts:** a shared package can't be
tree-shaken, because the host can't know which parts a future remote will use. The
shared `@angular/core` alone is 96.2 kB gzip — more than an entire self-contained
element, whose runtime is tree-shaken to what that one component needs. The same
applies to a version-scoped private copy: an MFE a major behind brings its whole
untree-shaken Angular family.

**Break-even:** Isolated costs ~35 kB + ~38 kB per MFE; Shared costs ~228 kB +
~2 kB per aligned MFE. Shared becomes lighter only at **~6 or more aligned MFEs
on one page** — above the 1–2 typical / ~5 maximum envelope. Raw (parse) size
follows the same pattern, so the CPU argument doesn't rescue it at low counts.

The Shared host's advantages are therefore not bytes at typical counts: one Angular
bootstrap for many MFEs, module-level singletons shared across aligned MFEs, and a
flat cost curve for pages that do compose many MFEs.

## Page math (Isolated)

| Isolated MFEs on one page (distinct versions, eager) | Framework tax (gzip) | Verdict                                                |
| ---------------------------------------------------------- | -------------------- | ------------------------------------------------------ |
| 1                                                          | ~35 KB               | Trivial                                                |
| 2                                                          | ~70 KB               | Comfortable                                            |
| 3                                                          | ~106 KB              | Fine — under the aggressive critical-path budget       |
| 5                                                          | ~175 KB              | At budget for framework alone; lazy-load               |
| 8–10                                                       | ~280–350 KB          | Heavy; only acceptable if most are lazy/below the fold |

Transfer is rarely the bottleneck (~35 KB gzip moves in well under a second on 4G).
The real cost on mobile is **parse/execute/bootstrap CPU**, paid once per runtime —
which is why the table compounds with eager runtime count, not byte count alone.

## The cost scales with two things — neither is "total MFE count"

1. **MFEs co-rendered per page**, not MFEs in the catalog. A reusable MFE appears in
   _many hosts_; that does not mean _many MFEs per page_. A realistic target envelope
   for coarse-grained, domain-level MFEs is **1–2 per page typically, ~5 at the busiest**
   → the green rows above.
2. **Distinct live versions per page** — and how each flavor pays for them:
   - **Isolated:** every MFE pays ~35–37 kB whether or not
     versions match, so version skew costs nothing _extra_. Two MFEs on two majors
     cost the same as two on one.
   - **Shared (share-when-aligned):** the page pays one untree-shaken runtime per
     distinct major (~190–230 kB gzip for the Angular family with Native
     Federation's loader), and aligned MFEs are then nearly free. During a
     migration with a one-major skew ceiling that is **two** full runtimes,
     transiently; a rare three-version exception means three.
   - **How often:** Angular ships one major per year, with 24 months of support
     per major, so under a one-major policy a migration window opens about once a
     year.

So with coarse-grained MFEs at 1–5 per page, self-contained is both the lighter and
the more predictable option: **~35–37 kB gzip per MFE, flat**, with version skew
adding nothing. Shared runtimes win on bytes only for pages that compose many
aligned MFEs (see the break-even above).

## Other duplication drivers (control these too)

The framework runtime is not the only thing that can duplicate. Heavy UI kits,
state libraries, and icon sets bundled per-MFE are how the "Hydra of Lerna"
anti-pattern actually bites. Mitigations:

- Prefer a **framework-agnostic (web-component-based) shared component library**
  loaded **once at the host** — it does not duplicate per MFE regardless of each
  MFE's Angular version.
- For large shared deps other than the framework, weigh the same trade-off: sharing
  avoids duplication but forgoes tree-shaking.
- **Lazy-load** MFEs that are below the fold or behind interaction, so only the
  critical-path runtimes count against initial load.

## Real features change the per-MFE cost

The ~35–37 kB floor is framework-only. In [`poc-isolated/`](./poc-isolated/), adding
the Angular router, `HttpClient` and the platform adapter took an MFE from 39.5 to
**80.2 kB gzip** (router ≈ 25 kB gzip of that). Under the Isolated host every MFE
that uses such features carries its own copy; under the Shared host they load once
per major. The more framework features each MFE uses, the lower the break-even with
the Shared host — re-measure with representative MFEs before treating the ~5-MFE
figure as settled.

## What is not yet measured here

- **Real feature weight.** The measured floor is framework-only; production MFEs add
  their own feature code on top of ~35 KB, which would raise LCP/TBT above the demo's
  numbers. The mobile Lighthouse run above isolates _framework_ overhead.
- **SSR cost at scale.** [`poc-ssr/`](./poc-ssr/) measured ~30 ms of extra server
  time per request locally (fragments fetched in parallel) and CLS 0 vs ~0.3
  client-only; production latency depends on network distance to the fragment
  endpoints and is bounded by the fragment timeout.
