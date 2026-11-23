---
name: consume-plans
description: Consume queued planning docs in docs/plan/ (or pasted planning text) into the running checklist docs/checklist.md, tick items the code shows are done, and archive the consumed docs in docs/plan/archive/. Use when the user runs /consume-plans, pastes planning text to queue, or asks to update the checklist.
---

# Consume plans

Planning docs wait in a queue, `docs/plan/`. A run folds everything queued into one living checklist, `docs/checklist.md`, checks the whole checklist against the code, and archives what it consumed. Git holds the checklist's history.

## Files

- **Queue:** every file in `docs/plan/`, not counting `docs/plan/archive/`.
- **Archive:** `docs/plan/archive/<YYYY-MM-DD>-<original name>.md`, using the date of the run. Committed with everything else.
- **Checklist:** `docs/checklist.md`. Create it on the first run with a `# Checklist` title. Items are grouped under `##` topic headings; reuse an existing heading when one fits, otherwise add one. Item format:

  ```markdown
  ## Experience services

  - [ ] Add deleteExperience service
    - Note: wrong saves need removing once the MCP tools exist.
    - Source: docs/plan/archive/2026-11-22-services.md
  - [x] Add updateExperience service
    - Done: `updateExperience` in `src/services/experience.ts`
  ```

  `Note:` is optional context or reasoning. `Source:` points at the archived doc the item came from. `Done:` is the evidence for a tick.

## Steps

### 1. Queue pasted text

If the user pasted planning text, save it to `docs/plan/<short-slug>.md` before anything else. **The repo is public:** first check it for secrets (keys, tokens, passwords, connection strings), personal data (emails, phone numbers, addresses, other people's names) or captured experience records. If there is any, stop and tell the user what you found; don't save it.

### 2. Investigate and draft (subagent)

Spawn one `general-purpose` subagent with the Agent tool, so the reading and merging happen in a fresh context. Give it the instructions below, with today's date filled in. Run it even when the queue is empty: it still checks the existing checklist against the code.

> You are drafting an update to the project checklist `docs/checklist.md`. **Don't write, move or delete any files**; return your result as text.
>
> Read, in full: every queued doc in `docs/plan/` (skip `docs/plan/archive/`), the current `docs/checklist.md` (it may not exist yet), and `CLAUDE.md`. Then investigate the code as much as you need for the rules below.
>
> Rules:
>
> 1. **Only actionable content becomes items.** An item is something that can be finished and ticked. Attach context or reasoning that helps understand an item as its `Note:`. Leave pure context (hypotheses, background, open musings) out; it stays in the archived doc.
> 2. **Ground items in the code.** Use the real names of files, functions, tables and commands where an item touches them. Don't invent names for things that don't exist yet; describe them plainly.
> 3. **Keep the queued doc's status.** Something described as deferred, a hypothesis or "only if needed" becomes an item that says so in its wording or note. Never upgrade a maybe into a commitment.
> 4. **Exact duplicates:** merge into the existing item silently (you may add the new `Source:`).
> 5. **Changes to a ticked item:** never edit or untick it. Add a new unticked item for the change, with a note saying what it changes.
> 6. **Contradictions** (a queued doc disagrees with an existing item, or two queued docs disagree with each other): don't resolve them. Draft the checklist with the existing item unchanged and list each contradiction.
> 7. **Check every unticked item, old and new, against the code.** If the code shows it's fully done, tick it and add `Done:` with the evidence (file and function, table, script, or commit). Tick only what's actually there; partly done stays unticked, with a note saying what's missing.
> 8. Each new item gets `Source: docs/plan/archive/<YYYY-MM-DD>-<original name>.md`, using today's date: <DATE>.
> 9. Keep the existing headings, order and wording of untouched items. Group new items under the best-fitting heading, or a new `##` heading.
>
> Return exactly three sections:
>
> - `## Checklist`: the complete new contents of `docs/checklist.md`, in a fenced markdown block.
> - `## Contradictions`: for each, the existing item, what the queued doc says, and which doc. Write "None" if there are none.
> - `## Report`: one line each for items added, merged, ticked (with evidence) and changed-ticked items, grouped under those four labels.

### 3. Resolve contradictions

If the subagent lists any, show each one to the user in chat as a short readable block (the existing item, the queued version, the source doc) and ask which to keep, in plain text, not a question dialog. Write nothing until all are answered. Then apply the answers to the drafted checklist yourself.

### 4. Write and archive

1. Write the drafted checklist (with the answers applied) to `docs/checklist.md`.
2. Move each consumed doc to `docs/plan/archive/<YYYY-MM-DD>-<original name>.md`. Use `git mv` for a tracked file and `mv` for an untracked one (for example one saved from pasted text in step 1).
3. Run `pnpm format:check`. If it flags `docs/checklist.md` or the archive, run `pnpm format`.

### 5. Report

Relay the subagent's report: items added, merged, ticked (with their evidence) and changed-ticked, plus the docs archived and how each contradiction was resolved. If the queue was empty, say so and report only the ticks.

Don't commit. The user reviews the diff and commits.
