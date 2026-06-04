# Claude

Claude-specific tooling — bound to Claude Code (or a particular stack), not portable to
other agents. Kept separate so the rest of the repo stays tool-neutral.

## Layout

- `scripts/` — standalone helper scripts (e.g. the statusline)
- `skills/` — slash-command skill definitions

More sub-folders (`hooks/`, `patterns/`) get added as they have real content.
