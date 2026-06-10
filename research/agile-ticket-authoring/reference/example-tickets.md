# Example tickets — one filled instance of each type

_Audience: **reference**_

A complete, realistic example of each [template](../team/templates.md), filled in. These are
invented throwaways to show what "good" looks like end-to-end — not real recommendations.
For bad→good _fixes_, see [`good-vs-bad-gallery.md`](good-vs-bad-gallery.md); this is the
finished article.

The Epic and Story below share one scenario (a service catalog) to show the parent/child
relationship; the Bug, Spike, and Enabler are independent.

---

## Epic

> # Teams can find who owns any internal service in seconds
>
> **Idea originator:** a backend developer who lost an afternoon chasing the owner of a
> flaky dependency
> **Goal this serves:** cut the time teams waste locating service owners and on-call info
>
> ## Why this matters
>
> When a service misbehaves, the consuming team often can't tell who owns it or who's
> on-call, so they ping channels, wait, and guess. It's a recurring tax on every incident
> and integration.
>
> ## Success looks like
>
> Any developer can find a service's owner, repo, and on-call in under a minute; the
> "who owns X?" questions in shared channels drop noticeably.
>
> ## Scope
>
> - In: a searchable catalog of services with owner, repo, and on-call, seeded from existing
>   metadata
> - Out: full dependency mapping and SLO tracking (later epics)
>
> ## Child stories
>
> Search by service name · view a service's owner & on-call · catalog auto-syncs from repo
> metadata. _(Each a vertical slice.)_
>
> ## Open questions / risks
>
> Where is the source of truth for ownership today? How stale is it?
>
> ## Loop-closing plan
>
> The originator searches for the dependency that cost her the afternoon and confirms she
> can reach the owner fast.

**Why this works:** outcome-framed title, the originator is named and carried to the
loop-closing plan, scope has an explicit _out_, and success is observable.

---

## Story

> # A developer can find a service by name
>
> ## Summary / Why
>
> The first slice of the catalog: typing a service name returns its owner, repo, and
> on-call, so a developer mid-incident can reach the right people fast.
>
> ## Story
>
> As a developer chasing a flaky dependency, I want to search the catalog by service name,
> so that I can reach its owner without pinging channels.
>
> ## Acceptance criteria
>
> - [ ] Searching an exact service name returns its owner, repo link, and on-call contact.
> - [ ] A partial match returns ranked suggestions.
> - [ ] An unknown name shows an empty state with a "request to add it" link, not a spinner.
>
> ```gherkin
> Scenario: Search by exact name
>   Given the catalog contains "payments-api" owned by the Payments team
>   When I search for "payments-api"
>   Then I see the Payments team as owner, the repo link, and the current on-call
> ```
>
> ## Out of scope
>
> Fuzzy search across descriptions; editing catalog entries.
>
> ## Design / UX
>
> «Figma link» — a single search box + result card. Keyboard-navigable; result announced to
> screen readers.
>
> ## Technical notes & constraints
>
> Read-only against the existing service metadata store; no new datastore. p95 < 400 ms.
> The _design_ of the search/index is open.
>
> ## Dependencies
>
> Parent: the catalog Epic.

**Why this works:** a thin vertical slice (real value on its own), binary AC with a
single-trigger scenario, an a11y note, and constraints stated as a box — not a blueprint.

---

## Bug

> # CSV export silently drops rows beyond 10,000
>
> ## Summary
>
> Large exports look successful but are truncated, so users act on incomplete data without
> knowing. Affects anyone exporting big reports.
>
> ## Steps to reproduce
>
> 1. Open a report with > 10,000 matching rows.
> 2. Export to CSV.
> 3. Open the file and count the rows.
>
> ## Expected
>
> All matching rows are exported, or the user is clearly told the export was capped.
>
> ## Actual
>
> Exactly 10,000 rows; no warning. The UI reports "Export complete."
>
> ## Environment
>
> Web, all browsers, prod build 5.3. Reproduces with any report over the limit.
>
> ## Severity / Priority
>
> Severity: high (silent data loss) · Priority: high (finance runs month-end exports Friday).
>
> ## Evidence
>
> Export of a 12,431-row report attached — 10,000 rows. Server log shows the cap.
>
> ## Acceptance criteria
>
> - [ ] Exports include all matching rows, or the user is warned and offered a paged/async
>       export.
> - [ ] Regression test covers an over-limit export.

**Why this works:** title names the observable symptom, repro is exact, severity and
priority are separate axes, and "silent" is called out as the real harm.

---

## Spike

> # Spike: should we adopt OpenTelemetry for tracing?
>
> ## Question
>
> Will OpenTelemetry meet our tracing needs, and what's the migration cost from what we use
> today?
>
> ## Why now
>
> Two upcoming epics need distributed tracing; we don't want to commit them to a tracing
> approach we haven't validated.
>
> ## Timebox
>
> 3 days.
>
> ## Deliverable
>
> A recommendation (adopt / don't / defer) with a rough migration estimate, captured in an
> ADR. A throwaway spike instrumenting one service is fine — not shippable.
>
> ## Done when
>
> - [ ] The question is answered and written down.
> - [ ] A decision is recordable (ADR drafted).
> - [ ] If "adopt," the first migration stories are identifiable.

**Why this works:** it's a _question_, not a build; the timebox and the
decision-not-code deliverable are explicit.

---

## Enabler

> # Enabler: cut the CI pipeline from ~14 min to under 5 min
>
> ## Risk / cost of inaction
>
> CI takes ~14 min, so developers context-switch on every push and PRs queue. It's a daily
> drag on flow and a growing complaint as the team scales.
>
> ## What changes
>
> Parallelize the test stages and cache dependencies between runs.
>
> ## Measurable improvement
>
> p75 pipeline time 14 min → under 5 min; fewer abandoned/queued PRs.
>
> ## Acceptance criteria
>
> - [ ] p75 CI time < 5 min over a week of real runs.
> - [ ] No loss of test coverage or flakiness introduced.
>
> ## Enables
>
> Faster review cycles; makes trunk-based work and smaller PRs practical.

**Why this works:** leads with the cost of _inaction_ in business terms, quantifies the
improvement, and names what it unblocks — so it can compete with feature work for priority.
