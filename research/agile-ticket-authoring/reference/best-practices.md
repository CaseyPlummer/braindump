# Backlog item best practices

_Audience: **reference**_

Current thinking on writing backlog items that work for a small delivery team and a
large silent audience at the same time.

## Mindset shifts worth knowing

- **"The card is a promise for a conversation" is weakening for distributed/async
  work.** That maxim assumed a colocated team where the ticket was a placeholder for a
  hallway chat. When the ticket is read by people who weren't in the room — or picked
  up asynchronously — it has to carry enough context to stand alone. You write _more_,
  but structured so skimmers and implementers each find their layer fast.
- **Outcome over output.** Lead with the change in the world, not the thing to build.
  This is where an architect adds the most value and where strategy tools (Aha!) push
  you anyway: goal → initiative → feature.
- **The user-story sentence is optional; the "so that" is not.** "As a / I want / so
  that" is a useful default, not a law — some teams now reject it outright (Linear calls
  it a "cargo cult ritual" that "silos engineers into a mechanical role"). The clause
  that matters is the **so that** — the value. For non-user-facing work, drop the costume
  and state intent plainly. **Job Stories** ("When _[situation]_, I want _[motivation]_,
  so I can _[outcome]_") are often better because they capture the trigger/context a plain
  user story omits.
- **INVEST is still the common bar** — Independent, Negotiable, Valuable, Estimable,
  Small, Testable; fail one and it isn't ready. In flow/Kanban teams, **FIRST** is a newer
  alternative — Feedback Loop, Independent, Right-Sized, Small, Testable — swapping
  _Valuable_ and _Estimable_ for _Feedback Loop_ and _Right-Sized_ (right-sizing over
  estimation). See [`kanban-flow.md`](kanban-flow.md).
- **Vertical slices, not layers.** Each item should deliver a thin end-to-end sliver
  of value, not "build the API" then "build the UI." Architects are tempted to slice
  by component — resist it.
- **In a flow / Kanban system, authoring changes.** Items are **right-sized to flow**
  (small, similar-sized) rather than story-pointed, and "ready" is an explicit **pull
  policy**, not a sprint gate. See [`kanban-flow.md`](kanban-flow.md).

## The architect's what-vs-how line

The most common failure mode for architect-written tickets is over-specifying the
implementation — it demotivates engineers and bakes in untested assumptions.

Own the **what and why**: the outcome, the value, the constraints, the boundaries.
Hand off the **how**: the design, the data structures, the patterns. State your
constraints as a _box_ the engineer designs inside — "must reuse the existing auth
service; p95 < 200 ms; no new datastore" — and let them choose the solution within it.
Where you have a real architectural decision, link the ADR rather than re-litigating
it in the ticket.

Think **fitness functions, not blueprints**: express the non-functional requirements
as measurable conditions, and let the implementation meet them however it best can.

## Anatomy of a good item (the workhorse Story)

A field order that reads top-to-bottom for both skimmers and implementers:

1. **Title** — outcome-oriented, plain language. "Users can reset their own password,"
   not "Implement password-reset endpoint."
2. **Summary / Why** (2–3 sentences) — problem, user, value. This is the part the wide
   audience reads and nothing else. Write it for them.
3. **Story / Job statement** — the As-a/so-that or When/so-I-can line.
4. **Acceptance criteria** — the testable contract (see below).
5. **Out of scope** — one line. Kills scope-creep arguments and tells readers what
   _not_ to expect.
6. **Design / UX** — embedded mockups and links. Designers live here; make it
   first-class, don't bury it.
7. **Technical notes / constraints** — the architect's section: NFRs, boundaries, ADR
   links, dependencies, contract/data changes. Constraints and context, not a
   step-by-step. Run the [NFR checklist](../team/nfr-checklist.md) for the easy-to-skip
   quality attributes.
8. **Dependencies / links** — blocked-by, relates-to, parent epic.
9. **Metadata** — size/estimate, labels/components, priority.

## Acceptance criteria — pick the right form

- **Given / When / Then (Gherkin)** — for behavioral, rule-based, testable flows.
  Pairs naturally with automated tests. **One trigger per scenario** — a single _When_,
  with conditions in _Given_; multiple \_When_s is the classic anti-pattern. Don't force
  GWT onto everything.
- **Checklist / rule list** — for "the page must show X, Y, Z" or constraint lists.
  Faster to read.
- **3–7 criteria.** More than that usually means the story is too big — split it.
- Each criterion must be **binary and testable**. No "works well," "is fast," "looks
  good." Quantify: "loads in < 2 s," "matches Figma frame 4."
- **Write them with the _Three Amigos_** (business + dev + test), not as a solo hand-off —
  acceptance criteria are collaborative, testable, living documentation (Specification by
  Example).
- **If the criteria are hard to write, the story is probably poorly sliced** — re-slice
  before refining further.

## Splitting a too-big story

When an item is too large to flow, split it into thin **vertical** slices — each delivers
visible behavior end-to-end, never "backend only" (which fails INVEST's _independent_ and
_valuable_ tests). Two well-known toolkits:

- **SPIDR** (Mike Cohn) — split by **S**pike (research an unknown), **P**ath (alternate
  paths, e.g. card vs. wallet), **I**nterfaces (by device/browser, or a complex UI
  delivered incrementally), **D**ata (support a subset first), or **R**ules (temporarily
  relax a business rule the story will ultimately need).
- **Humanizing Work's patterns** — workflow steps, operations (CRUD), business-rule
  variations, data variations, data-entry methods, major effort, simple/complex, defer
  performance, or break out a spike (last resort).

Choosing between candidate splits: prefer the one that lets you **deprioritize or drop**
a slice (80/20), or that yields **more equally-sized** small stories.

## Writing for a wide, mostly-silent audience

When a handful of people deliver the work but a whole organization reads it:

- **TL;DR at the top.** The first two sentences are the whole story for a skimmer.
  Assume most readers never scroll.
- **Plain language; expand each acronym once.** A finance lead and a junior engineer
  should both parse the Summary.
- **Visuals beat prose** for designers and execs — embed, don't only link.
- **Consistency is a feature.** When every ticket has the same shape, readers learn to
  scan it in seconds. Enforce it with the tool's description templates.
- **Link up, not just down.** Every item traces to its parent goal so any reader can
  answer "why are we doing this?"

## Anti-patterns

- Title describes the _solution_ instead of the _outcome_.
- No "so that" / no stated value.
- Acceptance criteria missing, vague, or 15 items long (= too big).
- Horizontal slice ("build the backend") with no user-visible value.
- Architect over-specifies the _how_; engineers have no design room.
- "Tech debt" with no stated business risk → it never gets prioritized.
- A spike with no timebox and no defined deliverable.
- A bug with a guessed cause in the title and no repro steps.
