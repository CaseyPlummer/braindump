# Warnings are failures

Treat compiler, type-checker, linter, and build warnings as failures, not noise — CI
does. A warning stream everyone ignores is just deferred breakage, and it trains people
to stop reading the output at all.

## Clean up as you go

When you touch a code area, clean up the warnings and temporary exclusions in it — even
pre-existing ones — whenever it makes sense to do so. **"Not my code" is not an excuse** —
if you're editing it, you own what it emits.

This isn't strictly file-scoped; the unit is the **area you're working in**. (Small, short
files tend to align well with sensible scope.) A warning a couple of functions away from
your change is fair game; one in an unrelated, far-off module is not.

## The part that actually matters: don't punt forever

Temporary exclusions — suppressions, `disable` comments, `ignore` directives, skipped
tests, "fix later" TODOs — are debt. They're fine as a deliberate, short-lived step. They
are **not** fine as a permanent resting state. Continually punting the same warning to
"later" is the thing to avoid; "later" has to actually arrive.

The bar is **forward progress**: every time you're in an area, the count of warnings and
temporary exclusions should trend down — not stay flat, not grow.

## Escape hatch

If a file or area is overwhelmingly pre-warned, don't silently balloon the task into a
cleanup marathon. Fix what's reasonable within scope, and **flag the rest** — surface the
remaining debt rather than either ignoring it or disappearing into it.
