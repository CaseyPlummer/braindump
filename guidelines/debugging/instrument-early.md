# Add instrumentation early when a diagnosis stalls

When a bug doesn't reveal itself quickly, stop guessing and make the problem visible.
Time spent adding logging upfront saves multiples of it later — a hard session can burn
hours when visibility is added too late.

## The trigger

If the first one or two attempts to diagnose an issue don't clearly reveal the root
cause, **pivot immediately to instrumentation** before trying more guesses. Don't grind
through a third, fourth, fifth blind attempt.

## What "instrumentation" means

Logging is the first reach, but it's not the only tool:

- **Log at the key points** — inputs, outputs, and the boundaries where the data
  changes hands. Include enough context to tell _which_ call and _what_ values.
- **Dump the relevant state** at the moment things go wrong, not just the final error.
- **Narrow the failure** — bisect the code path, comment out halves, or add asserts that
  fail loudly the instant an assumption breaks.

The goal is to replace a guess with an observation.

## Clean up after

Temporary diagnostics shouldn't outlive the bug. Once it's resolved, remove the
throwaway logging — or, if it's worth keeping, gate it behind a debug flag so it's off
by default rather than left noisy in the code.
