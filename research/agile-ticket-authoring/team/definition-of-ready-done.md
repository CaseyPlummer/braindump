# Definition of Ready & Definition of Done

_Audience: **team-facing**_

The team agreeing on these matters more than the templates. But treat them differently —
one is contested, one isn't:

- **Definition of Ready (DoR)** — what should be true before work starts. **Use with
  care:** a hard DoR _gate_ is a known anti-pattern (see the debate below). Treat it as
  lightweight, explicit **pull-policy guidance**, not a checkpoint that serializes work.
- **Definition of Done (DoD)** — is the work _actually_ finished? Applied before it's
  called complete. Uncontroversial — worth being strict about.

Keep both visible and treat them as living agreements, not bureaucracy.

## The Definition of Ready is contested — read this first

Credible practitioners argue against a DoR, and a flow system reframes it entirely:

- **Mike Cohn (Mountain Goat) recommends _against_ a DoR for most teams.** When "something
  must be _done_ before the next thing can _start_, it moves the team dangerously close to
  stage-gate process" — killing the concurrent engineering (overlapping analysis, design,
  code, test) that makes a team agile. Replace hard rules with _flexible guidelines_
  ("rough mockups started and far enough along," not "all screens fully mocked").
- **Robert Galen** keeps a _lightweight_ DoR for specific cases — cross-team/external
  **dependencies**, **insufficient understanding** (avoiding mid-flight story explosions),
  **skill gaps**, **requirement clarity** — as long as it never becomes a 100%,
  stage-gate, sprint-entry mindset.
- **In Kanban**, the native concept isn't a gate at all — it's **"Make Policies Explicit"**
  (one of the six Kanban practices): an explicit, agreed **pull policy** for what makes an
  item safe to start, visible on the board and improved over time. See
  [`kanban-flow.md`](../reference/kanban-flow.md).

**So:** the checklist below is **pull-policy guidance, not a gate.** Use it to have a
better conversation about whether an item is workable — never to block work that could
proceed concurrently. When in doubt, prefer pulling the item and surfacing the gap over
parking it in a queue.

## Ready — pull-policy guidance (story-level)

- [ ] **Value is clear** — the "so that" answers why anyone cares.
- [ ] **INVEST holds** (or **FIRST** for flow teams) — independent, valuable, small,
      testable; estimable _or_ right-sized.
- [ ] **Acceptance criteria** are written, binary, and 3–7 items.
- [ ] **Vertical slice** — delivers something observable end-to-end.
- [ ] **Design attached** if user-facing (mockups/Figma).
- [ ] **Dependencies known** and not blocking start.
- [ ] **Constraints/NFRs stated** (the box, not the blueprint).
- [ ] **Right-sized** — small and similar to your other items (or sized, if your team
      estimates).
- [ ] **Traces up** to a parent epic/goal.

## Definition of Done (Story-level)

- [ ] Acceptance criteria all met.
- [ ] Code reviewed and merged.
- [ ] Tests written and passing (incl. regression where relevant).
- [ ] Meets the stated NFRs.
- [ ] Docs/changelog updated if needed.
- [ ] Deployed to the agreed environment (or demonstrably deployable).
- [ ] No new known defects introduced.

## Definition of Done (Epic-level) — the stakeholder loop

> **Where this comes from.** "Closing the loop" is an established product/customer-feedback
> practice — notify the person who asked, once it ships — and it's one of Kanban's six core
> practices (_Implement Feedback Loops_). **Aha! Ideas implements it directly:** when the
> linked feature/epic is marked shipped, the idea auto-updates and subscribers (including
> the original submitter) are notified, with optional quick-comment buttons to capture
> their reaction. What's _ours_ here is only the **routing of it through the Epic-level
> DoD** as a delivery gate, rather than leaving it to the Ideas tool alone.

A story finishing with full AC coverage is **not** the same as an idea being realized.
The story is 1-of-many; the _idea_ belongs to the Epic. So the "did the person with the
great idea get to see how it turned out?" gate lives here, not on every story.

Carry an **Idea originator** field from the first ticket so the thread is never lost,
then close the loop at the Epic:

- [ ] All child stories meet their DoD.
- [ ] **Success criteria from the Epic are demonstrably met** (the before/after holds).
- [ ] **Loop closed:** the originator has reviewed the shipped outcome — via a demo,
      walkthrough, screenshots, or a written summary — and confirmed whether it addressed
      the pain. **This is feedback, not sign-off:** they validate the outcome; they don't
      approve the solution, expand scope, or set priority.
- [ ] Outcome captured where the idea began (e.g. a note back on the Aha! idea/feature)
      so the wider audience can see the result.
- [ ] Follow-up work (if the result spawned new ideas) is captured as new items.

If the originator's feedback says the pain _isn't_ solved, that's **new input to the
PO's prioritization** — one signal weighed against the greater goals — not an automatic
mandate to do more. The loop feeds the value owner; it doesn't bypass them.

### Why this is a scoping decision, not extra ceremony

The loop fails when teams try to bolt "show the stakeholder" onto a single story —
which story? Instead, let the hierarchy carry it: the **Story** proves correctness
(AC), the **Epic** proves the idea was realized (outcome + originator review). One
lightweight field (Idea originator) plus one Epic DoD line makes the loop reliable
without adding friction to day-to-day delivery.

## Keeping it lightweight

The loop should be one field and one checkbox, not a sign-off committee. The originator
review can be async (a recorded demo + a thumbs-up comment). The goal is that the
person who sparked the work _sees the result_ — nothing heavier.
