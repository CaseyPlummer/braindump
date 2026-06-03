# Reuse before building

Before building a new component, utility, helper, or abstraction, look for an existing one
that already fits. Reuse or extend it before creating a parallel version. Reinventing
something the codebase already has fragments the code, multiplies maintenance, and means
bugs get fixed in one copy but not the other.

## Look first

Actually look — don't assume nothing exists:

- Search the codebase for the behavior, not just the name you'd give it.
- Check the project's established conventions, shared modules, and any catalog of
  primitives or utilities.
- Scan how nearby code solves the same problem.

The cost of a 30-second search is tiny next to the cost of a duplicate that drifts.

## But reuse only when it genuinely fits

Reuse-first is not "force everything through the nearest existing thing." If making an
existing abstraction cover a new case means contorting it — piling on flags, special
cases, or parameters that only one caller uses — that's the wrong reuse. **A little
duplication is cheaper than the wrong abstraction.**

Reuse when the fit is real. When it isn't, build the new thing cleanly rather than bending
the old one out of shape. If two cases later prove they're truly the same, unify them
_then_, once the shared shape is obvious.

## When you do build new

Put it where it'll be found next time — alongside its siblings, named for what it does,
and surfaced in whatever catalog or convention the project uses to advertise reusables. A
new reusable nobody can discover just becomes the next thing somebody reinvents.
