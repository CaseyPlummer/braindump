# Performance: the cost of self-contained runtimes

The central objection to self-contained web-component MFEs is bundle/runtime
duplication. This quantifies it with measured numbers and shows why, for
coarse-grained MFEs with a shared-when-aligned policy, the cost stays inside
web-performance budgets.

## Measured baseline

Built with the [`isolation-demo/`](./isolation-demo/) project — minimal Angular 22, **zoneless**,
esbuild, production (TypeScript 6):

| Artifact                                                       | Raw     | Gzip          |
| -------------------------------------------------------------- | ------- | ------------- |
| One functional Angular Element (framework + trivial component) | ~106 KB | **~35.2 KB**  |
| Three independent runtimes on one page (combined)              | ~318 KB | **~105.7 KB** |
| JS heap, three runtimes coexisting                             | ~3.8 MB | —             |

Zoneless (the Angular 21+ default) removes zone.js (~10 KB gzip) and its bootstrap
overhead, so the per-MFE framework floor is **~35 KB gzip** — lower than commonly
cited figures from the zone.js era. This is the _duplication tax_: what you pay once
per **distinct Angular version live on a page**.

Reference budgets: critical-path JS ~250 KB (aggressive ~200 KB), total page ~1 MB,
Time-to-Interactive < 3 s (< 5 s on 3G/4G).

## Measured: mobile Lighthouse (three runtimes)

The three-runtime page run through Lighthouse on its **default mobile preset**
(Moto G4-class CPU + simulated Slow 4G):

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

## Page math

| Self-contained MFEs on one page (distinct versions, eager) | Framework tax (gzip) | Verdict                                                |
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
2. **Distinct live versions per page**, not MFE instances. With
   **share-when-aligned** (externalize the runtime as a shared singleton when
   versions match, fall back to a private copy when they don't):
   - **Steady state** (all aligned): one shared runtime per page — as cheap as
     pure federation. ~35 KB _once_.
   - **During a migration** (host moved to vNext, some MFEs still on vCurrent): the
     page loads one runtime per distinct version. With a one-major skew ceiling that
     is **two** runtimes (~70 KB), transiently, until laggards catch up. A rare
     exception allowing up to **three** distinct versions is still only ~106 KB.

So the honest steady-state cost of version independence is **+~35 KB gzip per extra
Angular major live on a page during migration windows** — bounded, transient, and
self-healing, not a permanent N× tax.

## Other duplication drivers (control these too)

The framework runtime is not the only thing that can duplicate. Heavy UI kits,
state libraries, and icon sets bundled per-MFE are how the "Hydra of Lerna"
anti-pattern actually bites. Mitigations:

- Prefer a **framework-agnostic (web-component-based) shared component library**
  loaded **once at the host** — it does not duplicate per MFE regardless of each
  MFE's Angular version.
- Apply the same **align-or-fall-back** sharing policy to other large shared deps.
- **Lazy-load** MFEs that are below the fold or behind interaction, so only the
  critical-path runtimes count against initial load.

## What is not yet measured here

- **Real feature weight.** The measured floor is framework-only; production MFEs add
  their own feature code on top of ~35 KB, which would raise LCP/TBT above the demo's
  numbers. The mobile Lighthouse run above isolates _framework_ overhead.
- **SSR cost.** Not evaluated — SSR is impractical alongside multiple self-contained
  runtimes and is treated as a separate, shared-singleton concern.
