# Stop and surface — when to pull each other in

_Audience: **team-facing**_

A short working agreement for knowing which decisions to make freely and which to make
visible first. Reciprocal: it applies to the architect as much as the engineers.

Drop a tailored copy into a real repo as `CONTRIBUTING.md` (or
`docs/working-agreement.md`) so it lives where the work happens.

## The principle

> **Pause and surface anything that's hard to reverse or affects people outside your
> own ticket. Move freely on anything reversible and local.**

This is the one-way-door / two-way-door test. A two-way door (easy to undo, local blast
radius) — just walk through it; that's what autonomy is for. A one-way door (costly to
reverse, or others have to live with it) — make it visible and start a conversation
first.

**Surfacing is not asking permission.** It's making a decision visible early enough that
the people it affects can weigh in. Often the answer is "yep, go" — but now it was a
choice, not a surprise. This is the **Architecture Advice Process** ("seek advice, not
permission") at the ticket level: anyone can decide, having first consulted the people
affected and anyone with relevant expertise.

**When in doubt, surface.** It's cheap to ask and expensive to undo. Nobody is ever in
trouble for surfacing something that turned out to be fine.

## Stop and surface before…

Keep this list short on purpose — it's examples of the principle, not an exhaustive
rulebook. If something feels like a one-way door that isn't listed, the principle still
applies.

**Dependencies**

- Adding a new third-party package (license, bundle size, maintenance, security surface).
- A major-version upgrade of a core dependency, or removing/replacing/forking one.

**Patterns & architecture**

- Introducing a pattern others will copy (state management, data fetching, error
  handling).
- A new abstraction or library that changes "how we do X" here.
- A new module/service boundary, or a new dependency across an existing boundary.
- Solving something a second way when an established pattern already exists.
- Changing build config, CI/CD, or tooling.

**Contracts & data**

- Changing a shared/public API contract or interface others consume.
- Database schema changes or migrations.
- Any breaking change to something downstream.

**Cross-cutting & sensitive**

- Auth/authz, secrets, or anything touching security or personal data.
- Logging/telemetry approach, or changes with a performance-budget impact.
- Touching shared or global configuration.

**Scope & intent** _(the quiet one — easiest to skip, most expensive to skip)_

- The ticket turns out bigger or different than written — **stop, don't silently
  expand it.**
- The acceptance criteria can't be met as written, or a requirement looks wrong.
- Deviating from the design/mockups, or from a recorded decision (ADR) — use the
  deviation path (a short written proposal / RFC to challenge the pattern, not a quiet
  workaround).

**Irreversibility**

- Deletes, data migrations, anything hard to roll back, anything public-facing.

## Move freely on…

So the list above doesn't read as "ask about everything":

- Implementation choices inside your ticket that follow an established pattern.
- Refactors local to code you own with no contract change.
- Anything covered by an existing ADR/pattern — just follow it.
- Naming, structure, and design decisions within the constraints you were given.

That's the whole point of the boundaries: inside them, you have real autonomy.

## How this stays effortless (not nagging)

Three mechanisms so the system prompts the pause — nobody has to _remember_ to surface,
and nobody feels singled out:

1. **This doc** — the shared why.
2. **A PR-template checklist** — a self-check at PR time (below). Turns "remember to
   surface" into a box you tick.
3. **CODEOWNERS on sensitive paths** — auto-requests review when high-value files change
   (below). The machine flags it, not a person.

### PR template (`.github/pull_request_template.md` or equivalent)

```md
## What & why

«One or two sentences. Link the ticket.»

## Surfaced anything? (tick if it applies, and say where you raised it)

- [ ] Adds/upgrades/removes a dependency
- [ ] Introduces a new pattern or abstraction others will follow
- [ ] Changes a shared contract, schema, or public interface
- [ ] Touches auth, secrets, security, or shared config
- [ ] Scope grew beyond the ticket as written
- [ ] Deviates from the design or a recorded decision (ADR)

If any are ticked: where was this discussed? «link the thread / ADR / message»

## How to verify

«Steps for a reviewer.»
```

### CODEOWNERS example (`.github/CODEOWNERS` or equivalent)

```text
# Surfacing the highest-value one-way doors automatically.
# A change to any of these auto-requests architect review — no one has to remember.

package.json            @architect
package-lock.json       @architect
**/build.config.*       @architect
.github/workflows/      @architect
src/core/**             @architect      # shared modules others depend on
docs/adr/               @architect      # decisions
```

_Tailor the paths to the repo. The point isn't the exact list — it's that the
highest-value surfaces ask for a second look by themselves, so the human side of this
doc is reserved for judgment calls a file-path rule can't catch._

## A note on reciprocity

This binds the architect too. Before imposing a new pattern, the architect surfaces it
the same way — proposes it, takes input, records it as an ADR. A boundaries doc that
only constrains one side isn't an agreement; it's a directive, and it won't hold. The
fastest way to get engineers to surface their one-way doors is to visibly surface yours.

## Sources

The **one-way / two-way door** framing is from Amazon (popularized via Jeff Bezos's
shareholder letters; good summary at thoughtbot). "Automate the guardrail" maps to
architectural **fitness functions** (Thoughtworks); CODEOWNERS is a GitHub feature. See
[`research-findings.md`](../reference/research-findings.md) for full citations.
