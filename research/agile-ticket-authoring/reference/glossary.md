# Glossary — the kit's terms

_Audience: **reference**_

Plain-language definitions of the concepts and acronyms this kit uses. For **tool names**
(Aha!/Jira/Azure DevOps equivalents) see [`dictionary.md`](dictionary.md) instead — this
glossary is concepts, that one is translation.

---

## Authoring

- **Outcome over output** — write items for the change in the world (value), not the volume
  of stuff built. → [`best-practices.md`](best-practices.md)
- **User story** — "As a «role», I want «capability», so that «value»." The _so that_ is the
  part that matters. → [`best-practices.md`](best-practices.md)
- **Job story** — "When «situation», I want «motivation», so I can «outcome»." Alternative to
  the user story; captures the trigger. → [`best-practices.md`](best-practices.md)
- **INVEST** — quality bar for a story: **I**ndependent, **N**egotiable, **V**aluable,
  **E**stimable, **S**mall, **T**estable. → [`best-practices.md`](best-practices.md)
- **FIRST** — flow-oriented alternative to INVEST: **F**eedback-loop, **I**ndependent,
  **R**ight-sized, **S**mall, **T**estable (swaps Valuable/Estimable). → [`kanban-flow.md`](kanban-flow.md)
- **Vertical slice** — an item that cuts through all layers to deliver visible behavior
  end-to-end. The opposite, a **horizontal slice** ("build the API"), delivers no standalone
  value. → [`best-practices.md`](best-practices.md)
- **SPIDR** — five ways to split a too-big story: **S**pike, **P**ath, **I**nterfaces,
  **D**ata, **R**ules (Mike Cohn). → [`best-practices.md`](best-practices.md)
- **Acceptance criteria (AC)** — the binary, testable conditions that define "done" for an
  item. → [`best-practices.md`](best-practices.md)
- **Gherkin / Given-When-Then (GWT)** — a behavioral AC format: Given (context), When (a
  single trigger), Then (result). → [`best-practices.md`](best-practices.md)
- **Three Amigos** — writing AC collaboratively with business + dev + test, not as a solo
  hand-off (from Specification by Example). → [`best-practices.md`](best-practices.md)
- **NFR (non-functional requirement)** — a quality attribute (security, performance, a11y…)
  rather than a feature. → [`nfr-checklist.md`](../team/nfr-checklist.md)

## Flow / Kanban

- **WIP (work in progress)** — items started but not finished; deliberately **limited** to
  create flow. → [`kanban-flow.md`](kanban-flow.md)
- **Pull system** — work is _pulled_ when capacity frees up, not _pushed_ in a planning
  event. → [`kanban-flow.md`](kanban-flow.md)
- **The four flow metrics** — **WIP**, **Throughput** (items finished per unit time),
  **Work Item Age** (start → now), **Cycle Time** (start → finish). Replace velocity/points.
  → [`kanban-flow.md`](kanban-flow.md)
- **Right-sizing** — making items small and similar so they flow predictably, instead of
  estimating each in points. → [`kanban-flow.md`](kanban-flow.md)
- **Service Level Expectation (SLE)** — a probabilistic delivery promise ("85% finish within
  8–10 days") from historical cycle time. → [`kanban-flow.md`](kanban-flow.md)
- **Monte Carlo** — simulation that forecasts "when will this set be done?" as a probability
  distribution; more accurate than averages. → [`kanban-flow.md`](kanban-flow.md)
- **Options / replenishment** — pre-commitment work is "options" (many discarded); pulled
  into delivery via explicit **replenishment** criteria. → [`kanban-flow.md`](kanban-flow.md)
- **Definition of Workflow (DoW)** — the Kanban _Guide's_ mandatory artifact: explicit
  started/finished points, states, WIP limits, policies, and an SLE. → [`kanban-flow.md`](kanban-flow.md)
- **Make Policies Explicit** — the Kanban _Method's_ practice of writing the rules down so
  they can be discussed and improved. → [`kanban-flow.md`](kanban-flow.md)
- **Classes of Service** — differentiated handling (expedite/standard/fixed-date/intangible);
  **contested** (Vacanti says they harm predictability). → [`kanban-flow.md`](kanban-flow.md)

## Readiness & done

- **Definition of Ready (DoR)** — what should be true before work starts. Use as lightweight
  **pull-policy guidance**, not a hard gate (a stage-gate DoR is an anti-pattern). → [`definition-of-ready-done.md`](../team/definition-of-ready-done.md)
- **Definition of Done (DoD)** — the bar an item meets before it's called complete. → [`definition-of-ready-done.md`](../team/definition-of-ready-done.md)
- **Closing the loop / Idea originator** — the practice of notifying the person whose idea it
  was once it ships; tracked via an "Idea originator" field and an Epic-level gate. → [`definition-of-ready-done.md`](../team/definition-of-ready-done.md)

## Architecture & governance

- **ADR (Architecture Decision Record)** — a short, immutable record of one significant
  decision and its rationale. **MADR** (options-centric Markdown) and the single-sentence
  **Y-statement** are lighter formats. → [`adr-template.md`](../team/adr-template.md)
- **Architecture Advice Process** — anyone may make an architectural decision, having first
  sought _advice_ (not permission) from those affected + experts (Harmel-Law). → [`stop-and-surface.md`](../team/stop-and-surface.md)
- **Architecture Advisory Forum** — a recurring, low-ceremony meeting where decisions-in-flight
  get advice, not sign-off.
- **Fitness function** — an automated, objective test of an architectural characteristic
  (e.g. "no imports across this boundary"); a guardrail CI enforces. → [`stop-and-surface.md`](../team/stop-and-surface.md)
- **Golden path / paved road** — a supported, best-practice default that reduces effort while
  leaving teams free to deviate ("paths not cages"). → [`research-findings.md`](research-findings.md)
- **Platform-as-a-product** — treat an internal platform as a product, with the other dev
  teams as customers. → [`research-findings.md`](research-findings.md)
- **Thinnest Viable Platform (TVP)** — the smallest platform that helps; ship it and iterate
  on developer feedback. → [`research-findings.md`](research-findings.md)
- **One-way / two-way door** — a reversibility test: deliberate before one-way (hard-to-undo)
  decisions; move fast on two-way ones. → [`stop-and-surface.md`](../team/stop-and-surface.md)
- **Stop and surface** — make a decision visible before acting if it's hard to reverse or
  affects others; the Advice Process at ticket level. → [`stop-and-surface.md`](../team/stop-and-surface.md)
- **Walking skeleton** — the thinnest end-to-end first slice that exercises the whole path
  (Cockburn). → [`research-findings.md`](research-findings.md)
- **Reference slice** — the first, production-quality instance of a pattern that the architect
  builds for others to copy. _(Concept used in the personal decision-rights notes.)_
- **Altitude split** — separating ownership by level: value/priority (PO), Epic framing
  (PO + architect), story authoring (engineers), significant decisions (architect). → [`cheat-sheet.md`](cheat-sheet.md)

## AI-assisted authoring

- **Capstone prompt** — the prompt run at the _end_ of a working session to crystallize it
  into a handoff-ready ticket (summarize → confirm → write). → [`ai-prompts.md`](ai-prompts.md)
- **HITL (human-in-the-loop)** — the consensus discipline for AI authoring: AI drafts, humans
  verify and decide; never ship AI output unreviewed. → [`ai-prompts.md`](ai-prompts.md)
- **Ghost APIs** — a documented AI failure mode: acceptance criteria that reference endpoints
  that don't exist. → [`research-findings.md`](research-findings.md)
- **RAG (retrieval-augmented generation)** — grounding AI output in real docs (e.g. your
  OpenAPI spec) so it can't invent Ghost APIs. → [`research-findings.md`](research-findings.md)
