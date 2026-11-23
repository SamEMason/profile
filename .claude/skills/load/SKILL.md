---
name: load
description: Load the project's current state at the start of a session by reading recent git history and the roadmap docs/roadmap.md, then report what was done last and what comes next. Use when the user runs /load or asks to load or catch up on the project.
---

# Load

Get up to speed: what was done recently, and what's next on the roadmap. Read and report only.

## Steps

1. Run `git status --short` to see uncommitted work. No output means a clean tree.
2. Run `git log --oneline -30` for the recent commits, newest first.
3. Read `docs/roadmap.md` in full.

Don't read `docs/plan/archive/`. The roadmap is the plan; archived docs are superseded history.

## Report

Briefly:

- **Uncommitted:** what's changed, or "clean".
- **Recently done:** the last few commits grouped by what they built, a line each.
- **Next:** the first roadmap item, quoted as written.

Then stop. Don't critique, reorder or question the roadmap, and don't start the next item. Wait for the user.
