# Never commit or push without an explicit instruction

Never run `git commit` or `git push` unless explicitly instructed to do so **in the
current turn**. Don't proactively offer to commit, and don't treat finishing a change as
license to commit it. Uncommitted changes are reviewed before they land — committing on
the author's behalf skips that review and risks landing something a glance would have
caught.

## The rule

- **Commit only on an explicit "commit." Push only on an explicit "push."**
- **They're separate.** Permission to commit is not permission to push. Each needs its own
  explicit instruction.
- **Approval doesn't carry forward.** Each commit and each push needs its own instruction
  in the current turn — an earlier "commit" doesn't authorize the next one.

## What does NOT count as an instruction

Only a literal "commit" or "push" counts. None of these authorize a commit:

- **Praise / approval** — "looks good", "nice", "perfect", "great", "that works"
- **Agreement** — "sounds good", "makes sense", "let's try it"
- **"ship it"** — ambiguous; ask what's meant rather than assuming
- **"this is ready"** — an observation, not a command
- **Silence** — no response after a change is finished is not consent

When in doubt, ask. Don't infer a commit from enthusiasm.

## Why this needs stating

Don't lean on a permission prompt to enforce this. Commit and push are often allowlisted
to avoid prompt fatigue, some agents run in auto-approve modes, and the gate differs
across tools. The rule is about **initiative, not mechanics**: never be the one who
decides it's time to commit. A commit proposed unprompted is already wrong — even if a
prompt would have approved it.
