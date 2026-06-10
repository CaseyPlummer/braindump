# Jira-flavored templates

_Audience: **team-facing**_

Paste-ready descriptions for the five item types. Markdown so they drop into any tool;
the field names lean Jira. See [`dictionary.md`](../reference/dictionary.md) to translate the
hierarchy to Aha! or Azure DevOps, and [`example-tickets.md`](../reference/example-tickets.md)
for a filled-in example of each type.

Conventions:

- `«angle brackets»` = replace.
- _Italic prompts_ = guidance; delete before saving.
- Keep the **Summary / Why** readable by a non-technical audience.

---

## Epic

The container for a stakeholder's idea. This is where the **stakeholder loop** lives —
see [`definition-of-ready-done.md`](definition-of-ready-done.md).

```md
# «Outcome-oriented epic title»

**Idea originator:** «who had the idea — carry this through to the end»
**Goal / initiative this serves:** «link up to the strategy»

## Why this matters

«2–4 sentences: the problem, who feels it, the value of solving it. Written for the
whole organization, not just the team.»

## Success looks like

«The observable outcome when this is done. Tie to a metric or a clear before/after.
This is what the originator will review at loop-closing time.»

## Scope

- In: «the slices of value this epic covers»
- Out: «explicitly excluded, to prevent creep»

## Child stories

«List or link the stories once decomposed. Each is a vertical slice.»

## Open questions / risks

«What still needs answering before or during delivery.»

## Loop-closing plan

«How the originator will see the result — demo, walkthrough, screenshots, a note.»
```

---

## Story

The workhorse. A thin vertical slice of value.

````md
# «Users can «do something valuable»»

## Summary / Why

«2–3 sentences a non-engineer can read. Problem + user + value.»

## Story

As a «role», I want «capability», so that «value».
_(or Job Story: When «situation», I want «motivation», so I can «outcome».)_

## Acceptance criteria

- [ ] «Binary, testable condition»
- [ ] «…»
      _(3–7 items. Use Given/When/Then below for behavioral rules — one trigger per
      scenario; put conditions in Given.)_

```gherkin
Scenario: «name»
  Given «context»
  When «action»
  Then «observable result»
```

## Out of scope

«One line.»

## Design / UX

«Embedded mockups + Figma link. First-class — don't bury it.»

## Technical notes & constraints

«NFRs and boundaries, not implementation. e.g. reuse X service; p95 < 200ms; no new
datastore. Link the ADR if a decision is already made.»

## Dependencies

«Blocked-by / relates-to / parent epic.»
````

---

## Bug

```md
# «Observable symptom — not a guessed cause»

## Summary

«What's wrong, who it affects, how bad.»

## Steps to reproduce

1. «…»
2. «…»

## Expected

«What should happen.»

## Actual

«What happens instead.»

## Environment

«Build/version, browser/OS, env, account/role if relevant.»

## Severity / Priority

Severity: «impact if it occurs» · Priority: «how soon to fix» _(distinct axes)_

## Evidence

«Screenshot / log / trace / error id.»

## Acceptance criteria

- [ ] No longer reproduces via the steps above
- [ ] «Regression test added where sensible»
```

---

## Spike (research / investigation)

A question to answer, not a thing to build.

```md
# Spike: «the question to answer»

## Question

«The specific decision this unblocks.»

## Why now

«What downstream work is waiting on the answer.»

## Timebox

«e.g. 2 days. The defining constraint of a spike.»

## Deliverable

«A decision + a doc/ADR / a recommendation / a throwaway prototype. NOT shippable
production code.»

## Done when

- [ ] The question is answered and written down
- [ ] A recommendation/decision is recordable
- [ ] Follow-up stories are identifiable (if the answer is "yes, build it")
```

---

## Enabler (tech debt / architectural runway)

Lead with the cost of _not_ doing it — that's what wins prioritization.

```md
# «Enabler: the technical improvement»

## Risk / cost of inaction

«The business consequence of leaving this. Make a PO and a wide audience care.»

## What changes

«The concrete technical change.»

## Measurable improvement

«Before → after. e.g. build 12m → 4m; remove the deprecated API blocking the v3
upgrade.»

## Acceptance criteria

- [ ] «The measurable target is met»
- [ ] «No regression in «area»»

## Enables

«The future features/work this unblocks. Link them.»
```
