# Roadmap

1. Capture foundation
   a. Tighten the existing services
      a1. Expand validation tests: empty and whitespace-only values for every text field (one table-driven test); unknown keys and database-managed fields (`id`, `profileId`, `createdAt`, `updatedAt`) rejected on save and update; invalid input never creates or changes a record; partial updates follow the same rules as save. Reset the database before each case in `tests/db/migrations.test.ts`, keeping what each case tests
      a2. `updatedAt` from Postgres: ``$onUpdate(() => sql`now()`)`` in the schema, no trigger
   b. MCP server over the experience services (save, list, get, update, delete)
      b1. `mcpServer(db)` with `save_experience` only; domain errors become readable tool errors
      b2. Test harness: in-memory MCP client (dev dependency) and `save_experience` tests
      b3. `list_experiences` and `get_experience`, with read-only hints, and tests
      b4. `update_experience` and tests
      b5. `delete_experience`, with a destructive hint, and tests
      b6. `serveMcp(databaseUrl)`: serve over stdio
      b7. `scripts/start-mcp.ts` and `pnpm start:mcp`: start Postgres, then serve
      b8. `.mcp.json`; check that stdout carries only protocol messages and that startup failures are reported clearly on stderr
      b9. Update `CLAUDE.md` layout and commands; document starting the server, connecting a client and running the MCP tests
   c. Ongoing capture skill
      c1. Propose a record: fill fields from what the user said or the skill observed (repo → project, changed files → skills), mark where each value came from, and ask for the rest
      c2. Check for duplicates: list experiences and compare; on a likely match, say "This may duplicate …" and show both side by side
      c3. Refine in a loop, then end with save as new (`save_experience`), update the existing one (`update_experience`) or drop; nothing is saved without approval
      c4. Confirm what was saved
   d. Backup and restore
      d1. `pnpm db:backup`: `pg_dump` to a timestamped file in `~/._.profile/backups`; keep every backup
      d2. Automatic backups before each `db:migrate`, and when `pnpm dev` or `pnpm start:mcp` starts (at most once a day)
      d3. `pnpm db:restore <file>`: merge, never wipe. Add missing rows; when an id exists in both, keep the live row and list the clash in the summary. Back up the live data first and require typing `restore` (`--yes` skips the prompt)
      d4. Restore tests in a temporary folder: deleted rows come back, new rows stay, live edits are kept and reported, and restore backs up first
2. Auth
   a. Better Auth, with `profile.userId`
   b. `resolveProfile` finds the signed-in user's profile, creating it on first sign-in; drop the single-profile check
3. Model layer
   a. Project table (replaces the `project` text)
   b. Skill table, linked many-to-many; move the "trimmed, non-empty" skill rule from `NewExperience` to it
   c. Source table, linked many-to-many
   d. Composition: experiences built from smaller experiences
   e. Project MCP operations
   f. Link-experience MCP operation
   g. Add a date for when the experience happened, allowing approximate dates
   h. Filter listed experiences by project, source and skill
   i. List the skills in use, so capture reuses existing names
4. Retrospective capture skill
5. CLI
6. HTTP API
7. Retrieval experiments
   a. Vector similarity for duplicate detection, shown as a score in the duplicate warning
8. Hosting
