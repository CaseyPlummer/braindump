# Worked example — idea to handoff

_Audience: **reference**_

One throwaway scenario traced through the whole kit, so the pieces visibly connect:
**idea → Epic → first reference Story → ADR → a surfaced dependency → loop closed.**

Everything below is invented to show the _shape_. It is not a real recommendation.

## The scenario

An internal platform team supports other developer teams (no direct customer-facing
work). A developer on another team — call her the **originator** — keeps hitting the
same friction: every team hand-rolls its own HTTP client to call internal services, so
retry/timeout/auth behavior is inconsistent and bugs recur. She raises it.

That's intake from **real developer pain**, not a wish-list item. Good starting point.

---

## 1. The architect works the problem (with an AI)

You spend a session digging in: how many teams, what they each do today, what "good"
looks like, what's reversible. You decide this is a **Tier-1 pattern** — widely copied,
costly to reverse — so you'll establish it personally, not delegate it cold.

At the stop point, you run the **capstone prompt** (see
[`ai-prompts.md`](ai-prompts.md)). The AI plays back its understanding, lists open
questions, recommends an **Epic + a first reference Story**, and flags one
`❓ NEEDS INPUT` (which teams must adopt first). You resolve it.

---

## 2. The Epic (carries the why, the loop, the priority)

You author the **Epic** — the why and the framing belong at architect/PO altitude.

```md
# Teams make internal service calls through one consistent client

**Idea originator:** «the developer who raised it»
**Goal this serves:** reduce recurring reliability bugs from inconsistent HTTP handling

## Why this matters

Every team hand-rolls HTTP clients, so retry, timeout, and auth behavior differ and the
same classes of bug keep recurring. A single shared, observable client removes a whole
category of defects and saves each team from re-solving it.

## Success looks like

New service calls go through one client; retry/timeout/auth behave identically
everywhere; the originator's team stops filing the recurring timeout bugs.

## Scope

- In: a shared client wrapper + the first team migrated as the reference
- Out: a full service mesh / gateway (revisit at larger scale)

## Loop-closing plan

The originator reviews the migrated first team and confirms the recurring bug is gone.
```

→ Templates: [`templates.md`](../team/templates.md). The **Idea originator** field and
**loop-closing plan** are the [`definition-of-ready-done.md`](../team/definition-of-ready-done.md)
Epic-DoD in action.

---

## 3. The ADR (the decision, recorded once)

Because this is architecturally significant, you record the decision so it isn't
re-derived or re-litigated. Abbreviated:

```md
# ADR-0007: One shared HTTP client wrapper for internal service calls

- Status: Accepted · Tier: 1
- Advice sought: platform team, two service owners, security reviewer

## Decision

We will provide and require a shared client that centralizes timeout, retry, auth, and
tracing.

## Constraints this imposes

- All outbound calls go through it — no direct client instantiation.
- Default timeout 3s; retry configured in the wrapper, not per-call.
- p95 added overhead < 5ms.

## Alternatives considered

- Per-team clients (status quo) — inconsistent, unobservable.
- Third-party mesh — too much infrastructure for current scale.
```

→ [`adr-template.md`](../team/adr-template.md). These **constraints** are exactly what flows into
the Story's "Technical notes" — the _box_, not the blueprint.

---

## 4. The first Story — the reference slice (you build it)

Tier-1 rule: **do the first one.** You build the first vertical slice — one team's calls
moved onto the client — as production-quality reference code others will copy. It lands
**merged in the real repo** (not a throwaway branch), because it _is_ the pattern.

```md
# The «first team»'s service calls run through the shared client

## Summary / Why

Prove the shared-client pattern end-to-end on one real team so others have a working
reference to copy, and the recurring timeout bug for this team goes away.

## Story

As a developer on «first team», I want my service calls to use the shared client, so
that retries/timeouts/auth behave consistently and the recurring bug stops.

## Acceptance criteria

- [ ] All of «first team»'s outbound calls route through the shared client
- [ ] Retry + timeout behavior matches ADR-0007 (3s default; wrapper-configured retry)
- [ ] The previously recurring timeout bug no longer reproduces
- [ ] p95 added overhead < 5ms (measured)

## Out of scope

Migrating other teams (separate stories).

## Technical notes & constraints

Implements ADR-0007. Reuse the existing auth-token provider. No new datastore. The
_design_ of the wrapper API is open — choose what reads cleanly.

## Dependencies

Parent: the Epic above.
```

Note what you _didn't_ do: dictate the wrapper's internal design. You set the
constraints (ADR) and built the reference; the shape of the API is left as real design
work.

---

## 5. A dependency gets surfaced (the system catches it)

While building, you find a code-generation library would make the client's typed methods
far nicer. That's a **new third-party dependency** — a one-way door. You don't just add
it.

- You open a short proposal noting license, bundle size, and maintenance health, and
  link it from the PR.
- The PR template checklist's "adds a dependency" box is ticked, pointing at that thread.
- **CODEOWNERS** on `package.json` auto-requests review anyway — the machine surfaces it,
  so it can't slip through silently.

→ [`stop-and-surface.md`](../team/stop-and-surface.md). The same rule binds engineers later when
_they_ migrate their teams — reciprocity, not a one-way leash.

---

## 6. Handoff — the rest is delegated (engineers author)

With the reference slice merged and the ADR recorded, the remaining teams' migrations
become **Tier-3** work: follow the established pattern. You **pair on the second**
team's migration to transfer the knowledge, then **delegate the third+**.

Here, engineers **author their own stories** — and that's good: they're technical, the
"user" is a developer, and they have a working reference plus the Ready pull-policy. Each
story they write must still state its "so that" and trace to the Epic, so none of them
drift into wish-list territory. → "Should engineers write their own stories?" is answered
by the readiness policy, not by a rule about who types.

---

## 7. The loop closes (the part most teams skip)

When the migrations are done, the **Epic** isn't done until the **originator sees the
result**: she reviews her migrated team and confirms whether the recurring bug is gone,
and a note goes back to where she first raised it so the wider org sees the outcome. This
is validation, not sign-off — if the bug _isn't_ gone, that's fresh input for the PO to
weigh against the greater goals, not a mandate.

A _story_ finishing with full AC coverage proved correctness. The _Epic_ closing proved
the **idea was realized** — and the person who had it got to see how it turned out.

---

## The pieces, connected

| Step                                 | Kit doc                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Work the problem → ticket            | [`ai-prompts.md`](ai-prompts.md) (capstone)                                                                  |
| Epic with why + originator           | [`templates.md`](../team/templates.md), [`definition-of-ready-done.md`](../team/definition-of-ready-done.md) |
| Record the decision                  | [`adr-template.md`](../team/adr-template.md)                                                                 |
| Tier-1 reference slice, you build it | the architect's decision-rights policy (tiers + reference slice)                                             |
| Dependency surfaced + caught         | [`stop-and-surface.md`](../team/stop-and-surface.md)                                                         |
| Engineers author the rest            | [`best-practices.md`](best-practices.md), readiness policy                                                   |
| Loop closed with the originator      | [`definition-of-ready-done.md`](../team/definition-of-ready-done.md)                                         |
