# Refinement guide — taking a draft to "ready"

_Audience: **team-facing**_

A drafted ticket isn't a ready ticket. **Refinement** is the step where the team builds
shared understanding and shapes an item until it's safe to pull. This is the bridge between
[authoring](../reference/best-practices.md) and delivery.

## Do it continuously, not in a big batch

Refine **a little, often** — just-in-time, only the items you're about to pull. The Kanban
name for this is **replenishment**: top up the "ready" lane from your options as capacity
frees up. You don't need to refine the whole backlog; most of it is **options** that may
never be built (see [`kanban-flow.md`](../reference/kanban-flow.md)). It works as a short recurring
session or as ad-hoc conversations — the cadence matters less than keeping it small and
current.

> **Refine the next slice, not the whole epic.** Detail decays — anything refined far ahead
> of being pulled is usually re-worked.

## Who's in the room — the Three Amigos

At minimum, three perspectives (not three people necessarily):

- **Business / value** (PO or product-minded lead) — is this worth doing, and why?
- **Development** — is it feasible, and how might it break?
- **Test / QA** — how will we know it's done; what are the edge cases?

Pull in the **Idea originator** when their intent is unclear, and the **architect** when the
item touches an architecturally-significant decision (then it needs an
[ADR](adr-template.md), not just a conversation).

## What happens — the working agenda

For each item being refined:

1. **Clarify intent.** Restate the **"so that"** and who feels the pain. If nobody can, it's
   not ready to pull — send it back to options.
2. **Right-size / split.** Too big to flow? Split into thin **vertical slices** using
   **SPIDR** or the Humanizing-Work patterns (see [`best-practices.md`](../reference/best-practices.md)).
   A story with 10+ acceptance criteria is a release in disguise.
3. **Sharpen the acceptance criteria — together.** Make them binary and testable; one
   trigger per Given/When/Then scenario. The Three Amigos writing them jointly _is_ the
   point (Specification by Example), not a hand-off.
4. **Surface risks, NFRs, and dependencies.** Run the
   [NFR checklist](nfr-checklist.md) for the easy-to-skip quality attributes; note blockers;
   spin off a **Spike** for any genuine unknown instead of guessing.
5. **Resolve the open questions.** Clear the `❓ NEEDS INPUT` markers from the draft (the AI
   capstone leaves these deliberately — see [`ai-prompts.md`](../reference/ai-prompts.md));
   anything unresolved is the agenda for the next conversation, not a reason to stall.
6. **Check readiness.** Does it meet the **readiness policy**
   ([`definition-of-ready-done.md`](definition-of-ready-done.md))? If yes, it's pullable. If
   not, decide: refine a bit more, or leave it as an option. **Don't turn this into a gate**
   — pull anything workable and surface the gap.

## What comes out

- A few items **ready to pull** (value clear, AC sharp, right-sized, traces to a goal).
- **Splits** — one big item became several thin ones; over-large items went back to options.
- **Spikes** logged for the real unknowns.
- The **originator looped** where their intent shaped the result.

## Anti-patterns

- **Refining too far ahead** — detailing options that may never ship; it's re-worked anyway.
- **Gold-plating** — perfecting AC on an item that should've been split or dropped.
- **DoR as a stage-gate** — blocking workable items on a checklist; converts pull to push.
- **PO solo hand-off** — skipping the Three Amigos, so dev and test first see the item when
  it's "done being written."
- **Refining everything** — treating the whole backlog as committed work instead of options.

## Where it sits in the kit

Capstone draft ([`ai-prompts.md`](../reference/ai-prompts.md)) **→ refinement (here)
→** ready to pull ([`definition-of-ready-done.md`](definition-of-ready-done.md)) **→**
delivery **→** Epic loop closed with the originator.
