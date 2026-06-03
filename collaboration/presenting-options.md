# Presenting options & decisions

How I like choices surfaced to me by any AI agent.
The goal is that I can skim, decide, and answer fast without re-quoting
anything back.

## Every decision needs three things

1. **A stable ID** for each question and each option, so I can answer by reference
   instead of restating the question.
2. **Brief pros/cons** for each choice — two to five words each, not paragraphs.
3. **A recommendation** — always one, even when it's just "the answer I'd pick if you
   only wanted to sign off."

## ID scheme

- **Flat numbering.** Every question in a batch gets a sequential number: `1`, `2`,
  `3`, … No prefixes, no nesting inside the ID.
- **Options are lowercase letters** (`a`, `b`, `c`).
- I answer like `1a, 2c, 3b` — commas optional, whitespace flexible. Nothing else
  required.
- **No sub-question IDs.** If a choice has follow-ups that depend on it, flatten them
  into the same sequence as their own numbers. Visual nesting (indent, sub-heading) to
  show the relationship is fine — the ID stays flat.
- If I reference an earlier batch's question later, re-quote it rather than relying on a
  stale number; numbers reset each batch.

## Formatting is separate from IDs

Make it skimmable: group by topic with headings, add a one-line framing per group,
indent follow-ups under their parent. Structure is for reading; IDs are for answering.

## Pros/cons

Two to five words per item. If a choice genuinely has no downside worth naming, say
"no major trade-off" explicitly rather than padding it.

## Recommendation

Always include one — even for open-ended questions, where it means "the answer I'd
propose if you just wanted to sign off." I should be able to reply "go with recs" and
move forward. If the answer is obvious, skip the menu entirely: state it as a
recommendation with a confirmation ask rather than enumerating options I'd never pick.

## Example

> ## UI
>
> One-line framing for the UI track if helpful.
>
> **1.** Pick-one question → options (a/b/c) + rec
> **2.** Follow-up that depends on how #1 lands → options + rec
>
> ## API
>
> **3.** Question → options + rec
> **4.** Question → options + rec

Answer: `1a, 2c, 3b, 4a`.
