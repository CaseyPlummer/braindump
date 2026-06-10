# ADR template

_Audience: **team-facing**_

An **Architecture Decision Record** captures one significant decision: what was decided,
why, and what it costs. It's the highest-leverage habit for an architect — write the
decision and rationale once, and engineers stop re-deriving it and stop re-litigating
it. New people learn the _why_ without a meeting.

## When to write one

Write an ADR for any **architecturally-significant** decision — one that's expensive to
reverse or will be copied widely. Not for routine choices.

## How to use it

- One decision per record. Keep them short — a page or less.
- Number them sequentially (`0001`, `0002`, …) and never delete one. A decision that's
  reversed gets a new ADR that **supersedes** the old; the old stays, marked superseded.
  The trail of _why we changed our minds_ is the point.
- Store them in the repo (e.g. `docs/adr/`) so they live next to the code and version
  with it.
- **Link the ADR from the ticket's Technical notes**, so the constraints travel with the
  work and nobody re-opens the decision in code review.

## Lighter formats, if this one's too heavy

The template below is a Nygard-style format with a couple of extra sections. Two
well-known lighter alternatives (both legitimate — pick one and stay consistent):

- **MADR** (Markdown ADR) — options-centric: list the considered options with pros/cons,
  plus metadata like deciders and confirmation status.
- **Y-statement** — a single sentence: _"In the context of «use case», facing «concern», we
  decided «option» to achieve «quality», accepting «downside»."_ Good for smaller decisions
  that still deserve a record.

---

## Template

```md
# ADR-NNNN: «short decision title»

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
- **Date:** «YYYY-MM-DD»
- **Deciders:** «who holds the decision rights here»
- **Advice sought:** «who was consulted — affected parties + relevant experts (optional; Advice Process)»
- **Tier:** «1 = costly to reverse / widely copied · 2 = significant»

## Context

«The forces at play: the problem, the constraints, the requirements (functional and
non-functional), and what makes this decision necessary now. Neutral — state the
situation, not the answer.»

## Decision

«The choice, stated plainly and actively: "We will …". One decision.»

## Constraints this imposes

«The box implementers must build inside — the part that flows into tickets. Measurable
where possible: boundaries, NFR budgets, required reuse, forbidden approaches.»

## Alternatives considered

- **«Option A»** — «why not / trade-off»
- **«Option B»** — «why not / trade-off»
  «Showing the roads not taken is what stops the decision being re-litigated later.»

## Consequences

- **Positive:** «what this buys us»
- **Negative / cost:** «what it costs, what becomes harder»
- **Follow-ups:** «new work this creates — link tickets/enablers»

## References

«Reference slice / PR, spike results, related ADRs, external docs.»
```

---

## Worked micro-example (throwaway scenario)

```md
# ADR-0007: Use a single shared HTTP client wrapper for all service calls

- **Status:** Accepted
- **Date:** 2026-01-15
- **Deciders:** Architecture (lead architect)
- **Advice sought:** platform team, two service owners, security reviewer
- **Tier:** 1 — costly to reverse / widely copied

## Context

Teams were each instantiating their own HTTP clients with inconsistent retry, timeout,
and auth-header handling. This produced unpredictable failure behavior and duplicated
auth logic across modules. We need one consistent, observable way to make outbound
calls before we add more services.

## Decision

We will provide and require a single shared HTTP client wrapper that centralizes
timeouts, retries, auth-header injection, and tracing.

## Constraints this imposes

- All outbound service calls go through the wrapper — no direct client instantiation.
- Default timeout 3s; retry policy is configured in the wrapper, not per-call.
- p95 added overhead < 5ms.

## Alternatives considered

- **Per-module clients (status quo)** — flexible, but inconsistent and unobservable.
- **A third-party gateway/mesh** — powerful, but too much infrastructure for current
  scale.

## Consequences

- Positive: consistent failure behavior, one place for auth/tracing, easier to reason
  about.
- Negative: a shared component that must be versioned carefully; a migration cost for
  existing call sites.
- Follow-ups: reference slice in `core/http` (ADR-linked); enabler ticket to migrate
  existing call sites.

## References

- Reference implementation: PR #«nnn» (`core/http`)
- Migration enabler: «ticket link»
```

_This is illustrative only — invented to show the shape, not a real recommendation._
