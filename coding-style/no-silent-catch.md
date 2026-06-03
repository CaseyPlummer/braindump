# No silent catch blocks

Never swallow an error silently. A catch that discards what it caught is worse than no
catch at all — it hides the failure and makes the bug invisible later.

## The rule

Every catch must do one of these, in order of preference:

1. **Re-throw** — if this layer can't meaningfully handle the error, let it propagate
   (optionally wrapped with added context).
2. **Handle it** — recover in a way that's actually correct for the situation, not just
   to make the error go away.
3. **Log it with context** — if you genuinely continue past it, record what failed and
   enough detail to diagnose (which operation, which inputs).

## The one exception

A deliberately empty catch is allowed _only_ when the ignore is intentional **and** a
comment says why. No comment → it reads as a bug.

```
// bad — failure vanishes
try { risky() } catch {}

// good — surfaced with context
try { risky() } catch (err) { log.error("risky() failed during checkout", err) }

// acceptable — intentional, explained
try { cleanup() } catch { /* best-effort; cleanup failure is non-fatal here */ }
```

The example is pseudocode — translate it to whatever the language uses (thrown
exceptions, `Result` types, error returns). The principle doesn't change: a caught
error must be surfaced, handled, or explicitly and visibly ignored.
