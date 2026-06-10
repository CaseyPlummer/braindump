# Kanban & flow — how a pull system changes ticket authoring

_Audience: **reference**_

Most "how to write a story" advice is quietly Scrum-shaped (sprints, story points,
sprint-entry gates). If you run **Kanban / flow**, several of those assumptions change.
This is the flow-native layer for the rest of the kit.

All claims here are from the verified research pass — see
[`research-findings.md`](research-findings.md) for sources and confidence.

## Two canonical sources (they differ)

Two authoritative texts define Kanban, structured differently — worth knowing which you're
quoting:

- **The Kanban _Method_** (David Anderson / Kanban University) — **six general practices**
  (visualize, limit WIP, manage flow, _make policies explicit_, _implement feedback loops_,
  improve collaboratively) and **classes of service**.
- **The Kanban _Guide_** (Vacanti / Coleman) — the **four flow metrics**, a mandatory
  **Definition of Workflow**, and probabilistic forecasting; it does _not_ mandate a
  Definition of Ready, Definition of Done, or classes of service.

Where they agree (flow-as-goal, WIP limits, pull, explicit policies) this doc treats it as
settled; where they differ it says so.

## Flow is the organizing principle, not sprints

The Kanban Guide (Vacanti/Coleman) defines Kanban as **"a strategy for optimizing the
flow of value through a process."** You're not filling time-boxes; you're keeping work
moving smoothly from start to finish. That reframes a few things:

- There's no "sprint" to fit an item into, so **sizing-to-a-sprint stops mattering** —
  what matters is that items flow without stalling.
- Work is **pulled when there's capacity**, not pushed in a planning event.

## The four flow metrics (these replace velocity)

Kanban mandates exactly four:

| Metric            | Definition                                       |
| ----------------- | ------------------------------------------------ |
| **WIP**           | Items started but not finished                   |
| **Throughput**    | Items finished per unit of time                  |
| **Work Item Age** | Time from start to _now_, for an unfinished item |
| **Cycle Time**    | Time from start to finish                        |

Velocity and story points are not part of this. Predictability comes from **managing
flow**, not from estimating points (Vacanti: "managing flow is the best strategy for
predictability").

## WIP limits + pull (not a sprint plan)

A flow system **explicitly limits WIP** and runs as a **pull system**: _"when WIP drops
below the control… that can be a signal to select new work."_ Capacity decides when an
item starts — start work "only when there is a clear signal that there is capacity to do
so." Practically: finish before you start; the board pulls the next item when a slot
opens.

## Right-sizing instead of story points

Instead of estimating each item in points, **right-size** items so they're small and
similar enough to flow predictably, then forecast probabilistically from history:

- Visualize **cycle time on a scatterplot**; read percentile lines (e.g. 50th / 85th /
  95th) to forecast "how long will this take" with a confidence level.
- Commit to a **Service Level Expectation (SLE)** — a probabilistic delivery promise like
  "85% of items finish within 8–10 days," derived from history and stated as a range +
  probability, not a single date.
- For multi-item forecasts ("when will this _set_ be done?"), **Monte Carlo simulation** is
  the most accurate method — never averages.
- This is positioned as an **alternative to story-point estimation**. Caveat: accuracy
  degrades when item sizes are highly variable — which is _why_ right-sizing matters.

**Authoring implication:** write items small and of comparable size. If an item is much
bigger than your typical card, split it (vertical slices — see
[`best-practices.md`](best-practices.md)) so the board's forecasts stay meaningful.

**FIRST over INVEST (optional).** Some flow teams swap the INVEST checklist for **FIRST**
— Feedback Loop, Independent, Right-Sized, Small, Testable — which replaces INVEST's
_Valuable_ and _Estimable_ with _Feedback Loop_ and _Right-Sized_, matching the flow
emphasis on rapid feedback and capacity-fit over up-front estimation.

## "Ready" is a pull policy, not a gate

The readiness basis is the Method's practice **"Make Policies Explicit"** — write down,
visibly, the agreed conditions under which an item may be pulled, and improve them over
time. The Kanban _Guide_ expresses the same idea as the **Definition of Workflow**: an
explicit shared agreement covering the started/finished points, workflow states, WIP limits,
flow policies, and a Service Level Expectation. Either way, readiness is **explicit,
lightweight pull guidance**, not a stage-gate — a hard DoR gate that blocks concurrent work
is a known anti-pattern (see the debate in
[`definition-of-ready-done.md`](../team/definition-of-ready-done.md)).

In flow terms, work _before_ the commitment point is **options** — possibilities, many
expected to be discarded — not a fixed "ready" backlog. Items are pulled into delivery via
explicit **replenishment** criteria when capacity exists, rather than admitted through a
gate.

## Classes of Service — contested, handle with care

Classic Kanban (David Anderson) promotes **classes of service** (expedite, standard,
fixed-date, intangible) as a core practice. **Vacanti disagrees**, arguing classes of
service _"negatively impact predictability"_ (Thoughtworks concurs, via Little's Law).
This is a genuine disagreement among credible flow sources — so don't adopt classes of
service as settled good practice. If you use them, watch what they do to your cycle-time
distribution.

## What this means for the rest of the kit

- **Sizing:** prefer right-sizing + cycle-time forecasting over story points.
- **Definition of Ready:** treat it as explicit pull-policy guidance, never a gate.
- **The stakeholder loop:** aligns with the Method's _Implement Feedback Loops_ practice —
  one of its six — so closing the loop with the originator fits naturally here.
- **Everything else** (outcome-over-output, vertical slices, the what/why line, ADRs,
  stop-and-surface) is framework-agnostic and applies unchanged.
