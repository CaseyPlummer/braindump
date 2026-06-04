Re-orient after a context compaction. When a long session is compacted, the summary
captures most facts but not the _weight_ of durable rules — agents routinely drift from
their instruction files, memory, and active skill prompts after compaction. This skill
forces a re-read before work resumes.

## Focus hint (if provided)

**Focus:** `$ARGUMENTS`

If a focus hint is present, treat it as the signal for which part of the rule set you've
been drifting on, and bias your re-read toward the instruction files and docs that cover
that area. If no hint is given, do the full re-read with no bias.

## Step 1 — Re-read the durable surfaces

Read these in parallel. Don't skim.

1. **Global agent instructions** — the user/machine-level rules that apply across every
   project (a global `CLAUDE.md` / `AGENTS.md` or the equivalent for your tool).
2. **Project instructions** — the repo's own rules file (`CLAUDE.md` / `AGENTS.md` /
   contributing guide), authoritative for this codebase.
3. **Memory / durable notes** — the memory index first, then any specific note whose topic
   matches the active task.
4. **Active skill or prompt files** — whichever the summary says you were working from (a
   build or refactor brief, a review skill, etc.). Re-read its definition.

## Step 2 — Resume

Acknowledge the reload in one line ("Reloaded." / "Reloaded, focused on <area>.") and
continue from where the summary left off. Don't enumerate the rules or summarize what was
re-read; the human will redirect if something surfaced that changes course.

## What this skill does NOT do

- **Re-scan the codebase.** Architecture and catalog docs describe current state — they're
  the source of truth, not a fresh grep.
- **Re-run tests or builds.** That's a separate preflight/review step.
- **Replace the summary.** The summary is still your task context; this skill rehydrates
  the rules that govern _how_ you work, not _what_ you're working on.
