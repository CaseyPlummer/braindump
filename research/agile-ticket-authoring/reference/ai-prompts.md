# AI prompts for ticket authoring

_Audience: **reference**_

Prompts for getting an AI to write genuinely good tickets that match this kit. Designed
tool-agnostically — they work in any capable chat/agent.

The headline use case: you've spent a session working a problem _with_ an AI — building
understanding, adding context, doing research. At the point where you decide to stop
and hand off rather than implement, you want that shared understanding crystallized into
a ready-to-refine ticket. That's the **capstone prompt** below. Use the others when
you're starting cold, breaking down an epic, or pressure-testing a draft.

How they fit together:

1. **System prompt** — paste once at the start (or save as a custom instruction / agent
   persona). Teaches the house style.
2. **Capstone prompt** — at the end of a working session, convert the conversation into
   a ticket.
3. **Cold-start prompt** — when you have notes but no prior conversation.
4. **Epic → Stories prompt** — decompose a large item into vertical slices.
5. **Self-critique prompt** — pressure-test a draft against DoR/INVEST before handoff.

---

## 1. System prompt (house style)

> You are helping an architect write backlog items for handoff to a delivery team
> (designers and engineers) within an organization where a wide, mostly non-technical
> audience also reads them.
>
> Principles you always follow:
>
> - Lead with **outcome and value** (the "so that"), not the solution. The Summary must
>   be readable by a non-engineer.
> - Separate **what/why** (the architect owns) from **how** (the implementer owns).
>   State constraints and NFRs as a _box_ to design inside; never prescribe the
>   implementation. Express NFRs as measurable conditions.
> - Stories are **vertical slices** of value and obey **INVEST** (or **FIRST** for flow
>   teams).
> - Acceptance criteria are **binary and testable**, 3–7 items. Use Given/When/Then for
>   behavioral rules (one trigger per scenario; conditions in Given), a checklist
>   otherwise. Never use vague terms ("fast," "works well") — quantify.
> - Always include an **Out of scope** line.
> - Keep design/UX first-class for user-facing work.
> - Flag what's **unknown** rather than inventing it; list open questions explicitly.
> - Be concise and skimmable: a TL;DR a busy reader can grasp in two sentences.
>
> When you don't have enough information for a field, write `❓ NEEDS INPUT: <question>`
> rather than guessing. Never fabricate acceptance criteria, metrics, or constraints.

---

## 2. Capstone prompt — turn this session into a ticket

Use at the end of a working/research session, when the AI already has the context.

> We've now built up enough shared understanding. Stop solutioning and help me write a
> **handoff-ready ticket** capturing what we've figured out.
>
> Before you write it:
>
> 1. Summarize, in 5–8 bullets, **your current understanding** of the problem, the
>    decisions we reached, and the constraints — so I can catch any misunderstanding.
> 2. List the **open questions** that a refinement session would still need to answer.
> 3. Tell me what **item type** this should be (Epic / Story / Bug / Spike / Enabler)
>    and why. If it's too big for one Story, say so and recommend an Epic + a first
>    Story.
>
> Then wait for my confirmation. After I confirm, produce the ticket in this structure:
> Title · Summary/Why · Story or Job statement · Acceptance criteria (binary, 3–7) ·
> Out of scope · Design/UX notes · Technical notes & constraints (what/why only, no
> implementation) · Dependencies · Open questions.
>
> Rules: don't invent acceptance criteria or constraints we didn't actually establish —
> mark gaps as `❓ NEEDS INPUT`. Keep the Summary readable by a non-technical exec.
> Preserve the _reasoning_ behind decisions so the implementer understands intent, but
> leave the design to them.

_Why the two-step (summarize → confirm → write): it surfaces drift while it's cheap to
fix, and the summary itself becomes the ticket's context section._

---

## 3. Cold-start prompt — from raw notes

When you have material but no prior conversation. Robust to messy input (meeting notes,
bullets, a transcript, a half-formed doc).

> Below is my raw material for a backlog item — it may be messy (notes, transcript,
> bullets). Help me turn it into a handoff-ready ticket.
>
> First, **interview me**: ask the 3–5 highest-leverage questions whose answers most
> change the ticket (don't ask things the notes already answer). Wait for my answers.
>
> Then tell me the **item type** and draft the ticket in the standard structure
> (Title · Summary/Why · Story/Job statement · Acceptance criteria · Out of scope ·
> Design/UX · Technical notes & constraints · Dependencies · Open questions).
>
> Don't fabricate anything not supported by my material or answers — mark gaps as
> `❓ NEEDS INPUT`. Keep what/why separate from how.
>
> --- RAW MATERIAL ---
> «paste here»

---

## 4. Epic → Stories prompt — decompose into vertical slices

> Here is an Epic: «paste the epic, or reference the one above».
>
> Propose a breakdown into **Stories**, each a thin **vertical slice** of value
> (end-to-end, not by layer). For each story give: a one-line title, the value ("so
> that…"), and 3–7 draft acceptance criteria.
>
> Then:
>
> - Show the **dependency order** and which stories could be parallel.
> - Identify the **thinnest first slice** that delivers real value (a walking
>   skeleton).
> - Call out anything that should be a **Spike** (unknown) or **Enabler** (groundwork)
>   instead of a Story.
> - Flag where slices risk being **horizontal** (e.g. "backend only") and re-slice
>   them — use named patterns where useful (SPIDR: spike / path / interfaces / data /
>   rules; or Humanizing-Work patterns: workflow steps, CRUD, business-rule & data
>   variations, defer performance, etc.).
>
> Don't pad the list — fewer, genuinely independent slices beat many coupled ones.

---

## 5. Self-critique prompt — pressure-test before handoff

> Review this draft ticket as a skeptical reviewer preparing it for refinement. Check
> it against:
>
> - **INVEST** — is it independent, valuable, small, testable? Flag failures.
> - **Acceptance criteria** — are they binary and testable, or vague? Rewrite any weak
>   ones.
> - **What vs how** — does it over-specify implementation? Point to lines that constrain
>   the engineer's design unnecessarily.
> - **Audience** — could a non-technical reader understand the Summary?
> - **Slice shape** — is it vertical (delivers visible value) or horizontal?
> - **Gaps** — what's missing that refinement will get stuck on?
>
> Give me a short list of concrete fixes, then the revised ticket.
>
> --- DRAFT ---
> «paste here»

---

## Tips for use

- **Chain them.** Capstone → Self-critique is a strong default before handoff. For big
  work: Capstone (as Epic) → Epic→Stories → Self-critique on the first story.
- **Keep the system prompt loaded** throughout; it's what keeps the AI from drifting
  back into solutioning or vague AC.
- **Trust the `❓ NEEDS INPUT` markers** — they're the ticket telling you what
  refinement will ask. Resolve them before handoff, or leave them as the agenda for the
  refinement session.
- **Run the NFR checklist on the draft.** Security, accessibility, and other NFRs are what
  AI most often skips — [`nfr-checklist.md`](../team/nfr-checklist.md) catches them.
- **You own the why.** The AI drafts; you verify the intent and constraints are right.
  That's the part only the architect can sign off on.

---

## Why this design — 2024–2026 evidence

Recent research backs the human-in-the-loop discipline these prompts enforce:

- **AI-written stories meet acceptance criteria _less_ often than human ones.** A 2025
  study across 10 frontier models found LLM-generated user stories match humans on
  coverage and style but are **lower in diversity/creativity and pass acceptance-quality
  checks less frequently — regardless of model size.** That's the empirical case for the
  **self-critique pass** and your own review, not blind trust.
- **The dominant failure modes are hallucination and weak company/domain knowledge** (a
  2025 systematic review; OWASP LLM09:2025). The fix the literature converges on is
  exactly **human-in-the-loop / hybrid workflows** — which the capstone's
  summarize→confirm→write and the `❓ NEEDS INPUT` rule implement.
- **Drafting is the validated use; refinement stays human.** LLMs reliably turn a
  discovery conversation into _draft_ requirements; humans refine. Keep "you own the why."

**Native tooling is converging on the same pattern.** If you're in the tool rather than a
chat AI:

- **Jira (Atlassian Intelligence / Rovo)** — `/rovo` or `/ai` generates and transforms
  work-item content; Atlassian's own example prompts include "Generate acceptance criteria
  from this work item description" and "Suggest subtasks to break down this Story" — and
  it ships a **Job Story** template ("When… I want to… So I can…").
- **Azure DevOps** — Microsoft's **AI Work Item Assistant** turns a freeform idea into a
  titled/described/AC'd item and refines fields with **safe previews** ("choose field →
  prompt → preview → Apply").

Both are **preview-then-apply** by design — the same verify-before-trust discipline as the
prompts here. Use whichever surface fits; the principles don't change. See
[`research-findings.md`](research-findings.md) for citations.
