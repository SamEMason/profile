---
name: consume-plans
description: Consume queued planning docs in docs/plan/ (or pasted planning text) into the running roadmap docs/roadmap.md by running /grill-me on them with the user, then archive the consumed docs in docs/plan/archive/. Use when the user runs /consume-plans, pastes planning text to queue, or asks to update the roadmap.
---

# Consume plans

Planning docs wait in a queue, `docs/plan/`. A run turns them into the roadmap `docs/roadmap.md` **through `/grill-me` with the user**, not by converting the docs. A doc is input to the interview; only what the user confirms goes on the roadmap, in the user's words. Consumed docs are archived. Git holds the roadmap's history.

## Files

- **Queue:** every file in `docs/plan/`, not counting `docs/plan/archive/`.
- **Archive:** `docs/plan/archive/<YYYY-MM-DD>-<original name>.md`, using the date of the run. Committed with everything else.
- **Roadmap:** `docs/roadmap.md`. Its structure, order and level of detail are whatever the grilling settles; don't impose a template.

## Steps

### 1. Queue pasted text

If the user pasted planning text, save it to `docs/plan/<short-slug>.md` first. **The repo is public:** check it for secrets (keys, tokens, passwords, connection strings), personal data (emails, phone numbers, addresses, other people's names) or captured experience records. If there is any, stop and tell the user what you found; don't save it.

### 2. Investigate (subagent)

Spawn one `general-purpose` subagent with the Agent tool, so the reading happens in a fresh context. It **only investigates**; it doesn't draft the roadmap. Instructions:

> Read, in full: every queued doc in `docs/plan/` (skip `docs/plan/archive/`), the current `docs/roadmap.md` (it may not exist), and `CLAUDE.md`. Investigate the code as needed. **Don't write, move or delete any files.** Return, briefly:
>
> - **Built:** what the code already does that the docs or roadmap mention, one line each with the evidence (file and function, table, script).
> - **Not built:** what the docs propose that doesn't exist yet, one line each, in the docs' terms.
> - **Disagreements:** where the docs disagree with each other, with the roadmap, or with the code.
>
> Don't draft roadmap items, don't rank or sequence anything, and don't add hedges or opinions.

### 3. Grill (`/grill-me`)

Invoke the `grill-me` skill with the Skill tool. Its plan is the queued docs and the current roadmap, plus the subagent's findings. Follow `grill-me` fully. Keep these in focus:

- What's being worked on now, what comes next, and in what order.
- Which proposals are real plans and which get dropped. Nothing goes on the roadmap unless the user confirmed it.
- The disagreements the subagent found.
- How the roadmap itself should look.

Ask in plain text, one question at a time. Write nothing until `grill-me` reaches its final shared-understanding summary and the user confirms it.

### 4. Write and archive

1. Write `docs/roadmap.md` from the confirmed summary only: the user's decisions, in the user's words. Don't pad it with doc text, evidence or hedges the user didn't ask for.
2. Move each consumed doc to `docs/plan/archive/<YYYY-MM-DD>-<original name>.md`. Use `git mv` for a tracked file and `mv` for an untracked one.
3. Search the repo (excluding `node_modules`, `.git` and `docs/plan/archive/`) for the consumed docs' old paths, and update the references.

Change only the roadmap, the archived docs and those references. The pre-commit hook formats staged files, so don't format the repo.

### 5. Report

Say what changed in the roadmap, which docs were archived, and which references were updated. Don't commit; the user reviews the diff and commits.
