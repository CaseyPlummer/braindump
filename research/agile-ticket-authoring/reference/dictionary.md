# Nomenclature dictionary — Aha! ↔ Jira ↔ Azure DevOps

_Audience: **reference**_

The same concept wears different names in each tool. This keeps an idea intact as it
moves between them. For the kit's own concepts and acronyms (INVEST, FIRST, SLE, ADR, the
flow metrics…), see [`glossary.md`](glossary.md).

## The gotcha: "PBI" is not a Jira word

**Product Backlog Item** is the **Azure DevOps Scrum-template** work-item type (and the
Scrum Guide's generic term for "anything in the backlog"). In **Jira** the equivalent
is a **Story**. Say "PBI" to a Jira-native engineer and they mentally translate to
"Story." Worth stating once in any house glossary.

## Hierarchy (top = strategy, bottom = task)

| Layer                        | Aha!                                   | Jira                                         | Azure DevOps                                                  |
| ---------------------------- | -------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| Strategy / outcome           | **Goal**, **Initiative**               | **Initiative** _(Advanced Roadmaps only)_    | **Epic** _(top level)_                                        |
| Large deliverable            | **Epic** _(optional)_ / master feature | **Epic**                                     | **Feature**                                                   |
| **Unit of work (the "PBI")** | **Feature**                            | **Story**                                    | **User Story** _(Agile)_ / **Product Backlog Item** _(Scrum)_ |
| Breakdown / detail           | **Requirement**                        | **Sub-task**                                 | **Task**                                                      |
| Defect                       | _(a feature type / via integration)_   | **Bug**                                      | **Bug**                                                       |
| Inbound demand               | **Idea** _(Ideas portal)_              | _(no native; Jira Product Discovery "Idea")_ | _(no native)_                                                 |
| Time container               | **Release** / **Phase**                | **Sprint** / **Version**                     | **Sprint** / **Iteration**                                    |

## Field / term differences

| Concept             | Aha!            | Jira                         | Azure DevOps                            |
| ------------------- | --------------- | ---------------------------- | --------------------------------------- |
| Size estimate       | Score / Effort  | Story Points                 | Story Points / Effort                   |
| Status flow         | Workflow status | Status (workflow)            | State                                   |
| Grouping tag        | Tag             | Label / Component            | Tag / Area Path                         |
| Priority axis       | Rank / Score    | Priority                     | Priority + Severity (Bugs)              |
| Acceptance criteria | Custom field    | Field or description section | **Acceptance Criteria** (native, Agile) |

## Aha! → Jira sync notes

Aha!'s own integration is **"intentionally flexible"** — its docs recommend **three**
record-type mappings, not one. Pick the one that matches how your hierarchy is organized,
and confirm what your team actually wired up rather than assuming:

| Option                      | Aha! → Jira mapping                                              |
| --------------------------- | ---------------------------------------------------------------- |
| **1 — Features to Epics**   | Feature → **Epic**, Requirement → **Story**                      |
| **2 — Epics to Epics**      | Epic → **Epic**, Feature → **Story**, Requirement → **Sub-task** |
| **3 — Features to Stories** | Epic → **Epic**, Feature → **Story/Task**                        |

With Jira **Advanced Roadmaps** (Initiatives) there are two more layered options — e.g.
Initiative → Initiative, Epic → Epic, Feature → Story/Task, Requirement → Sub-task. See
Aha!'s "recommended Jira mappings" doc for the authoritative list.

Aha!'s own recommended workflow is **plan in Aha! first, push to Jira/ADO only when
engineering is ready to execute** — Aha! Roadmaps is the upstream system of record, which
is why strategy fields typically flow one-way (Aha! → Jira).

Gotchas:

- **Pick a source of truth per field.** Bidirectional sync on the same field invites
  overwrite wars. Common split: strategy/why fields owned in Aha! (one-way → Jira);
  execution fields (status, points, dev comments) owned in Jira (one-way → Aha!).
- **Rich text and images can degrade** across the sync — keep a text equivalent of
  anything critical; don't rely on a pasted screenshot alone.
- **Hierarchy can flatten** — if Requirements map to sub-tasks, deep Aha! structures
  may not survive cleanly. Keep features appropriately sized.
- **Map workflow states explicitly** — Aha! and Jira statuses won't match 1:1; an
  unmapped state silently stalls the sync.
- **Changing a mapping breaks existing links** — altering an already-wired record-type
  mapping severs the links between previously-synced records (reimport or manual relink
  needed). Get the mapping right before you sync at scale.

## Migrating ADO → Jira (vocabulary survival kit)

If you're moving from ADO habits to Jira:

- ADO **Product Backlog Item / User Story** → Jira **Story**
- ADO **Feature** → Jira **Epic**
- ADO **Epic** → Jira **Initiative** (needs Advanced Roadmaps) or a label/parent-link
- ADO **Task** → Jira **Sub-task**
- ADO **State** → Jira **Status**; ADO **Area Path** → Jira **Component/Label**;
  ADO **Iteration** → Jira **Sprint**
- ADO has a native **Acceptance Criteria** field; in Jira it's a description section or
  a custom field — decide where it lives and be consistent.
