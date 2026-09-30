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
| + 1 MFE on another major                        | ~+37 kB                   | **+140–155 kB** per extra major     |

**Why Shared is heavier at small MFE counts:** a shared package can't be
tree-shaken, because the host can't know which parts a future remote will use. The
shared `@angular/core` alone is 96.2 kB gzip — more than an entire self-contained
element, whose runtime is tree-shaken to what that one component needs. The same
applies to a version-scoped private copy: an MFE a major behind brings its whole
untree-shaken Angular family.

**Break-even (minimal MFEs):** Isolated costs ~35 kB + ~38 kB per MFE; Shared costs ~228 kB +
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

So with **lean** MFEs at 1–5 per page, Isolated is both the lighter and the more
predictable option: ~35–37 kB gzip per MFE, flat, with version skew adding nothing
extra. With **feature-rich** MFEs the byte advantage flips to the Shared host at about
two MFEs per page — see the measured break-even below.

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

## Feature-rich MFEs: measured break-even

The comparison above used minimal MFEs. Re-measured with **representative** MFEs —
each with internal routes (Angular router), `HttpClient` data loading, a reactive form
with validators and standard pipes — and hosts that use the router and `HttpClient`
too. All MFEs Angular 22.2, above the fold, loaded in parallel; kB = 1,000 bytes, gzip
level 9; Lighthouse mobile preset, median of 5.

| Per-MFE cost              | Isolated                  | Shared                                             |
| ------------------------- | ------------------------- | -------------------------------------------------- |
| Host / fixed cost         | 77 kB                     | ~275 kB (core 96, router 29, forms 14, http 13, …) |
| Each additional MFE       | **106.5 kB**              | **~3.6 kB**                                        |

| MFEs | JS Isolated / Shared | LCP, simulated (ms) | All MFEs rendered, DevTools-throttled (ms) |
| ---- | -------------------- | ------------------- | ------------------------------------------ |
| 1    | 183 / 278 kB         | **2,599** / 3,970   | **4,275** / 9,070                          |
| 2    | 290 / 282 kB         | **3,134** / 3,865   | **5,164** / 9,176                          |
| 3    | 396 / 286 kB         | **3,695** / 4,025   | **5,850** / 9,214                          |
| 5    | 609 / 293 kB         | 5,085 / **4,069**   | **7,378** / 9,381                          |
| 8    | 929 / 304 kB         | 7,017 / **4,590**   | **8,994** / 10,538                         |
| 10   | 1,142 / 311 kB       | 8,517 / **4,772**   | **10,544** / 11,222                        |

Break-even (interpolated):

- **Bytes: ~2 MFEs.** With feature-rich MFEs, sharing pays for itself almost
  immediately (the minimal-MFE estimate was ~5).
- **Simulated LCP: ~3.5 MFEs.** Lighthouse's default (simulated) throttling favors the
  Shared host from about four MFEs up.
- **DevTools-throttled time to all MFEs rendered: no crossover up to 10** (the gap
  narrows from 4.8 s to 0.7 s; a linear fit crosses at ~11). The Shared host can't
  paint until its federation module graph resolves — each hop costs a round trip —
  so its first paint is ~7.4 s vs ~2.1 s here.
- **With one MFE on another major** (N = 3, one on Angular 21): Isolated 391 kB /
  3.7 s simulated LCP vs Shared 480 kB / 5.7 s — a second major erases the Shared
  host's advantage.

The two throttling modes disagree mainly on network round trips; real-world results
likely fall between them, and warm caches or pages sharing heavy UI libraries would
favor the Shared host further.

**Takeaways:**

- At **1–2 MFEs per page**, the Isolated host loads faster under both measurement
  modes.
- At **3–5 feature-rich MFEs**, the result depends on the measure: the Shared host
  transfers far less and wins on simulated LCP; the Isolated host still renders
  everything sooner on the clock.
- **Budgets:** feature-rich Isolated MFEs cost ~106 kB gzip each, so two eager MFEs
  already exceed an aggressive ~250 kB critical-path JS budget. Keep MFEs lean,
  lazy-load MFEs below the fold or behind interaction, and treat the per-page MFE
  count as a budget.

## What is not yet measured here

- **Real feature weight.** The measured floor is framework-only; production MFEs add
  their own feature code on top of ~35 KB, which would raise LCP/TBT above the demo's
  numbers. The mobile Lighthouse run above isolates _framework_ overhead.
- **SSR cost at scale.** [`poc-ssr/`](./poc-ssr/) measured ~30 ms of extra server
  time per request locally (fragments fetched in parallel) and CLS 0 vs ~0.3
  client-only; production latency depends on network distance to the fragment
  endpoints and is bounded by the fragment timeout.
