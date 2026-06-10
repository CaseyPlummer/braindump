# Agile ticket authoring

A kit for writing backlog items that stakeholders _and_ engineers can both read —
plus AI prompts for turning a research/requirements session into a handoff-ready
ticket.

Written from the perspective of an architect who does the discovery, then hands off
implementation. The bias throughout: **state the what and the why; leave the how to
the implementer.**

## Files

Organized by **audience**, which maps to the folders. 

### `team/` — share/adopt verbatim

- [`templates.md`](team/templates.md) — paste-ready Jira-flavored templates: Epic, Story,
  Bug, Spike, Enabler.
- [`nfr-checklist.md`](team/nfr-checklist.md) — a quality-attributes checklist (security,
  a11y, performance, observability…) to run while authoring/refining. A prompt, not a gate.
- [`definition-of-ready-done.md`](team/definition-of-ready-done.md) — DoR and DoD
  checklists, including the **stakeholder loop** (the idea's originator sees how it turned
  out — an Epic-level gate, not a Story-level one).
- [`definition-of-workflow.md`](team/definition-of-workflow.md) — a sample Kanban board +
  flow policies (options → ready → in progress → done → loop), showing where DoR / DoD /
  the loop map.
- [`refinement-guide.md`](team/refinement-guide.md) — how a drafted ticket becomes "ready":
  continuous, just-in-time refinement with the Three Amigos.
- [`adr-template.md`](team/adr-template.md) — an Architecture Decision Record template
  (with a worked example) for capturing significant decisions so they aren't re-litigated.
- [`stop-and-surface.md`](team/stop-and-surface.md) — a reciprocal working agreement for
  which decisions to make freely vs make visible first (the one-way/two-way-door test),
  with a starter trigger list, a PR-template checklist, and a CODEOWNERS example.

### `reference/` — share freely as useful

- [`best-practices.md`](reference/best-practices.md) — the principles: what makes a good
  backlog item, the architect's what-vs-how line, and writing for a wide audience.
- [`good-vs-bad-gallery.md`](reference/good-vs-bad-gallery.md) — six before/after ticket
  transformations — the principles made concrete.
- [`example-tickets.md`](reference/example-tickets.md) — a complete filled-in example of
  each template (Epic / Story / Bug / Spike / Enabler).
- [`glossary.md`](reference/glossary.md) — plain-language definitions of the kit's concepts
  and acronyms (INVEST, FIRST, SLE, ADR, the flow metrics…); distinct from the tool
  dictionary.
- [`dictionary.md`](reference/dictionary.md) — Aha! ↔ Jira ↔ Azure DevOps nomenclature, so
  the same concept survives the move between tools.
- [`kanban-flow.md`](reference/kanban-flow.md) — the flow-native layer: how a Kanban pull
  system changes sizing and "ready" (flow metrics, WIP/pull, right-sizing vs story points,
  the contested classes of service).
- [`cheat-sheet.md`](reference/cheat-sheet.md) — the whole kit distilled to one pinnable
  page.
- [`worked-example.md`](reference/worked-example.md) — one throwaway scenario traced
  end-to-end (idea → Epic → reference Story → ADR → surfaced dependency → loop closed) so
  the pieces visibly connect.
- [`research-findings.md`](reference/research-findings.md) — a 2024–2026 cited synthesis
  of current best practices for ticket authoring (Kanban-leaning, deep on AI-assisted
  authoring), with confidence tags and sources.
- [`ai-prompts.md`](reference/ai-prompts.md) — the AI workflow: a house-style system
  prompt, the **capstone** (session→ticket) prompt, cold-start, Epic→Stories, and a
  self-critique pass.

### `personal/` — local-only working notes (gitignored, not committed)

A couple of architect's working-notes docs live here on your machine; they're intentionally
kept out of the public kit.

## The one-paragraph version

A ticket is a unit of _shared understanding_, not a spec. Lead with the outcome and
the value (the "so that"), make the acceptance criteria binary and testable, slice
vertically so each item delivers something visible, and trace every item up to the
goal it serves. The smaller your team and the wider your silent audience, the more the
ticket has to stand on its own.
