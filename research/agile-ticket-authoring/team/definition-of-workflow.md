# Definition of Workflow — a sample board + flow policies

_Audience: **team-facing**_

The Kanban _Guide's_ one mandatory artifact is a **Definition of Workflow (DoW)**: a shared,
explicit agreement about how work flows. This is a concrete sample you can adapt — it turns
the kit's abstract pieces (options, readiness, DoD, the loop) into one board.

**Adapt the columns, limits, and SLE to your team.** The point isn't these exact values —
it's that they're _explicit_ and visible, so you can discuss and improve them.

## The board

```
   OPTIONS         │   READY (≤3)  │ IN PROGRESS (≤3) │ IN REVIEW (≤2) │     DONE
  (uncommitted)    │   committed,  │   being built    │  review /      │  (meets DoD,
  ideas + backlog  │   pullable    │                  │  verify        │   deployable)
 ──────────────────┼───────────────┼──────────────────┼────────────────┼──────────────
                   ▲ commitment point                                  ▲ finished point
                   (cycle-time clock starts)                           (clock stops)

  ── then, at the Epic level, after all child stories are Done ──▶  LOOP CLOSED
                                          (originator reviewed the shipped outcome)
```

- **Options** is uncommitted — your idea pool / backlog (Aha! ideas live here). Most options
  are never built; don't refine them all.
- **Ready → In Review** is committed, WIP-limited flow. Finish before you start.
- **Done** is the story finished point. The **Epic loop** is a separate, higher-altitude gate.

## The six DoW elements

1. **Work item types that flow here** — Story, Bug, Spike, Enabler (see
   [`templates.md`](templates.md)).
2. **Started + finished points** — _started_ = an item enters **Ready** (committed via
   replenishment); _finished_ = it enters **Done**. Cycle time is measured between them.
3. **Workflow states** — the columns above.
4. **WIP limits** — Ready ≤ 3, In Progress ≤ 3, In Review ≤ 2 (tune to team size).
5. **Explicit policies** — the per-transition rules below.
6. **Service Level Expectation (SLE)** — e.g. _"85% of items finish within 9 days of
   entering Ready,"_ derived from your own cycle-time history, not a guess.

## Explicit policies (the pull / completion criteria)

| Transition                  | Policy                                                                                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Options → Ready**         | The **readiness policy** (this is your DoR): value clear ("so that"), AC sharp & testable, right-sized, traces to a goal. Lightweight — pull anything workable, don't gate. |
| **Ready → In Progress**     | A slot is free (WIP < limit); take the highest-priority ready item; one person/pair owns it.                                                                                |
| **In Progress → In Review** | AC implemented; self-tested; PR open; the ticket's NFRs addressed.                                                                                                          |
| **In Review → Done**        | Reviewed & merged; tests pass; **meets the DoD**; deployable/deployed; no new known defects.                                                                                |
| **Done → Epic loop closed** | All child stories Done; Epic success criteria demonstrably met; **originator reviewed the outcome** (validation, not sign-off).                                             |

## Where the kit's gates map

- **Definition of Ready** → the **Options → Ready** pull policy. Lightweight guidance, _not_
  a stage-gate — see the debate in [`definition-of-ready-done.md`](definition-of-ready-done.md).
- **Definition of Done** → the **In Review → Done** completion criteria.
- **The stakeholder loop** → the **Epic-level** gate after all child stories are Done — the
  one most teams skip.

## Managing it day to day

- **Watch Work Item Age**, not just position: an item sitting in In Progress past your SLE is
  aging — swarm it before starting anything new.
- **Replenish Ready just-in-time** (see [`refinement-guide.md`](refinement-guide.md)) — keep
  it small; a deep Ready lane is just options pretending to be committed.
- **Limit WIP for real.** When a column is full, help finish what's there rather than
  starting more — that's what makes cycle time predictable. → [`kanban-flow.md`](../reference/kanban-flow.md)
