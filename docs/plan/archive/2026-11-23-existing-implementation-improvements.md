---
title: Existing Implementation Improvements
created: 2026-11-23T13:51:00-05:00
status: proposed
---

# Existing Implementation Improvements

## Context

A review of Profile's existing implementation identified several improvements to validation coverage, timestamp handling, database test isolation, planning tooling, and documentation.

These are refinements to existing functionality, not new product features.

The current single-profile implementation is temporary scaffolding ahead of authentication. Cross-profile isolation and concurrent profile initialization are excluded from this proposal.

## 1. Expand validation test coverage

The existing Zod schemas already centralize validation for creating and updating experiences.

- Add parameterized tests for empty and whitespace-only text fields.
- Test unknown properties, including attempts to supply database-managed fields.
- Verify that invalid inputs never create or modify records.
- Cover equivalent validation rules for partial updates.

Prefer improving test coverage over introducing additional validation abstractions. Refactor only if meaningful duplication emerges.

## 2. Use PostgreSQL timestamps for updates

PostgreSQL supplies insertion timestamps, while Drizzle's `$onUpdate` generates subsequent timestamps in JavaScript.

Consider using PostgreSQL's `now()` for updates so timestamps originate from the database.

Evaluate whether this belongs in the schema or update service. Avoid database triggers unless justified.

## 3. Isolate migration integration tests

Preserve testing the full migration sequence against a fresh PostgreSQL database.

Ensure individual test cases start with predictable data and don't depend on records left by earlier tests.

Reuse existing database-test infrastructure.

## 4. Improve `/consume-plans`

### Remove unrelated formatting

Remove the instruction to run repository-wide formatting as part of consuming planning documents.

The skill should modify only the confirmed roadmap, archived documents, and necessary reference updates.

### Standardize planning document headers

Establish a consistent metadata convention for documents entering `docs/plan/`.

Use YAML frontmatter containing:

- `title`: Human-readable document title.
- `created`: Actual creation timestamp in ISO 8601 format, including timezone offset.
- `status`: Initially `proposed`.

Example:

```yaml
---
title: Existing Implementation Improvements
created: 2026-11-23T14:30:00-05:00
status: proposed
---
```

Update `/consume-plans` to apply this convention when creating documents from pasted planning text.

For existing queued documents, preserve their original metadata when available. Do not invent historical creation timestamps.

Document the convention so future proposals use the same structure.

## 5. Correct outdated project documentation

Update `CLAUDE.md` to reflect the implemented PostgreSQL database, migrations, and persistence services.

Check the affected descriptions against the current implementation.

## Scope

- Preserve existing service behavior and public interfaces.
- Avoid unnecessary abstractions.
- Do not redesign the temporary single-profile architecture.
- Do not introduce new product features.
- Keep changes small and independently reviewable.

## Completion

The improvements should leave the existing implementation functionally unchanged, with stronger validation coverage, predictable test isolation, consistent timestamp ownership, safer planning tooling, standardized planning-document metadata, and accurate project documentation.
