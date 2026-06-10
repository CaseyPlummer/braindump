# NFR / quality-attributes checklist

_Audience: **team-facing**_

A prompt list for the non-functional requirements an author or refinement session is most
likely to forget. Skipped NFRs — security, accessibility, performance — are a documented
failure mode of both rushed tickets and AI-drafted ones, so it's worth a deliberate pass.

**This is a prompt, not a gate.** Most items won't apply to most tickets. Run down the
list, note the few that matter in the ticket's **Technical notes & constraints**, and move
on. The goal is to _not silently skip_ a quality attribute, not to answer every line.

**When to run it:** while authoring an item, and again in refinement. For AI-drafted
tickets, run it explicitly — that's exactly what AI tends to drop.

---

## Security

- [ ] Does this touch **authentication or authorization**? Who's allowed to do it?
- [ ] Any **untrusted input** to validate/sanitize, or **secrets** to handle?
- [ ] Does it widen the attack surface (new endpoint, new dependency, new permission)?

## Privacy & data protection

- [ ] Does it read, store, or transmit **personal/sensitive data**?
- [ ] Is the data **minimized, retained, and deletable** per policy?
- [ ] Does anything new get **logged** that shouldn't be (PII in logs)?

## Accessibility (a11y)

- [ ] **Keyboard-navigable** and screen-reader-labelled?
- [ ] Sufficient **colour contrast**; not relying on colour alone to convey meaning?
- [ ] Are error and status messages **announced**, not just shown?

## Performance

- [ ] Is there a **budget**? (e.g. p95 latency, payload size, query count.)
- [ ] Any **N+1 / unbounded query / large list** risk?
- [ ] Does it add work to a **hot path** or a high-traffic surface?

## Reliability & availability

- [ ] What happens if a **dependency is down or slow** (timeout, retry, fallback)?
- [ ] Is the operation **idempotent / safe to retry**?
- [ ] Any **data-integrity** concern on partial failure?

## Observability

- [ ] Can you **tell it's working in production** (logs / metrics / traces)?
- [ ] Is there a **signal/alert** for the failure mode that matters?
- [ ] Will support be able to **diagnose** an issue without a code change?

## Error handling & edge states

- [ ] **Empty, loading, and error** states defined (not just the happy path)?
- [ ] Boundaries: **zero / one / many / too-many**, and invalid input?
- [ ] What does the **user** see when it fails — a dead end or a way forward?

## Internationalization (i18n)

- [ ] Any **user-facing text** to translate (no hard-coded strings)?
- [ ] **Dates, numbers, currency, time zones** handled per locale?
- [ ] Layout survives **longer translated strings** / right-to-left if relevant?

---

## How to record it

Don't paste this whole list into the ticket. In **Technical notes & constraints**, write
only the items that apply, as constraints:

> _NFRs: p95 < 300 ms on the profile path; no PII in logs; empty + error states required;
> screen-reader labels on the new controls._

If an NFR is significant enough to constrain the design, it belongs in an **ADR**, not
buried in a ticket — link it.
