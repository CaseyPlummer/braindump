# Cheat-sheet

_Audience: **reference**_

The whole kit on one page. Pin it. Each section links to the full doc.

## The altitude split — who owns what

| Layer                                 | Owner                                            |
| ------------------------------------- | ------------------------------------------------ |
| Why + value + priority                | Product Owner (treat internal work as a product) |
| Outcome framing (the Epic)            | PO + architect input                             |
| Story authoring (the slices)          | Engineers, within the frame                      |
| Architecturally-significant decisions | Architect                                        |

Authoring ≠ decision rights ≠ value ownership. Split the fight by altitude and it stops
being zero-sum.

## Write the item — anatomy

Title (outcome, plain) · **Summary/Why** (2–3 sentences, exec-readable) · Story/Job
statement · **Acceptance criteria** (binary, testable, 3–7) · Out of scope · Design/UX ·
Technical notes & constraints (what/why, _not_ how) · Dependencies.
→ [`best-practices.md`](best-practices.md) · [`templates.md`](../team/templates.md)

- Lead with the **"so that"** (value). No value stated → not ready.
- **Vertical slices**, not layers (split with SPIDR / Humanizing-Work patterns). INVEST,
  or **FIRST** in flow teams.
- AC are **binary** — quantify, never "fast/works well."

## Prescriptiveness — the three tiers

| Tier | What                                         | Move                                         |
| ---- | -------------------------------------------- | -------------------------------------------- |
| 1    | New critical / widely-copied pattern         | Build the **reference slice**; pair; ADR it  |
| 2    | Applies an existing pattern in new territory | Reference + constraints; review design early |
| 3    | Additive / routine                           | Pattern link + AC; get out of the way        |

**Do the first one. Pair on the second. Delegate the third.**
Own that the pattern is _right_, not that you typed it.

## The two gates

- **Definition of Ready** — value clear, AC written, vertical slice, traces to a goal.
  _Use as lightweight **pull-policy guidance**, not a hard gate — a stage-gate DoR is a
  known anti-pattern (Cohn). It still bounces solution-first wish-lists._
- **Definition of Done (Story)** — AC met, reviewed, tested, deployable.
- **Definition of Done (Epic) — the loop:** success criteria met **and the idea's
  originator has seen the shipped outcome.** Carry an "Idea originator" field from item
  one. _("Closing the loop" is a real practice — Aha! Ideas does it; the Epic-DoD routing
  is ours.)_ → [`definition-of-ready-done.md`](../team/definition-of-ready-done.md)

## Flow (Kanban) — if you run a pull system

Flow, not sprints. Four metrics: **WIP · Throughput · Work Item Age · Cycle Time.** Limit
WIP and **pull** when capacity frees up. **Right-size** items to flow instead of
story-pointing; forecast from a cycle-time scatterplot. → [`kanban-flow.md`](kanban-flow.md)

## Stop and surface — one-way vs two-way doors

> Pause and surface anything **hard to reverse or affecting others**. Move freely on
> reversible, local work. Surfacing ≠ permission (the Advice Process, at ticket level).
> When in doubt, surface.

Triggers: new dependency · new pattern others copy · shared contract/schema change ·
auth/secrets/security · scope grew beyond the ticket · deviating from design/ADR ·
anything irreversible.

Make it self-enforcing: the doc + a **PR-template checklist** + **CODEOWNERS** on
`package.json`, build config, shared modules. → [`stop-and-surface.md`](../team/stop-and-surface.md)

## AI prompts — the workflow

1. **System prompt** — load the house style once.
2. **Capstone** — at the end of a working session: "crystallize what we figured out into
   a ticket" (summarize → confirm → write).
3. **Cold-start** — from messy notes; AI interviews you first.
4. **Epic → Stories** — decompose into vertical slices.
5. **Self-critique** — pressure-test against DoR/INVEST before handoff.

Gaps marked `❓ NEEDS INPUT` = your refinement agenda. → [`ai-prompts.md`](ai-prompts.md)

## Nomenclature — fast translation

"PBI" is an **ADO** word; in **Jira** it's a **Story**.

| Concept         | Aha!        | Jira     | ADO              |
| --------------- | ----------- | -------- | ---------------- |
| Big deliverable | Epic        | Epic     | Feature          |
| Unit of work    | Feature     | Story    | User Story / PBI |
| Breakdown       | Requirement | Sub-task | Task             |

→ [`dictionary.md`](dictionary.md)

## When in doubt

Outcome over output · what/why over how · surface over surprise · demonstrate over
decree.
