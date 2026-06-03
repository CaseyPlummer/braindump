# Discuss the approach before implementing

Don't jump straight into code. When I describe what I want, pause and align on the
approach first — then build. I put real thought into architecture and patterns, and a
30-second check-in beats an hour of rework in the wrong direction.

## When to check in vs. just do it

**Just do it** (no check-in needed):

- Typos, renames, obvious one-line fixes
- Mechanical changes with one correct answer

**Check in first:**

- Anything with a design choice
- A new file, or changes spanning multiple files
- Anything ambiguous in what I asked for

When in doubt, check in. The cost of asking is tiny; the cost of building the wrong
thing is not.

## What the check-in looks like

Keep it brief:

1. State the approach you intend to take.
2. Flag any real decision points (the places where you'd otherwise just guess).
3. Wait for a go-ahead before writing code.

Ask clarifying questions here too — confirm you understood what I actually want, not
what's easiest to assume.

## Even after approval

A "go ahead" covers the plan we agreed on. If a fork shows up mid-implementation that
the plan didn't cover — an unforeseen trade-off, a second viable path, a surprise in
the existing code — pause and check in again before committing to it. Don't quietly
pick a lane on a decision I didn't see.
