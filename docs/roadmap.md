# Roadmap

1. Capture foundation
   a. MCP server over the experience services (save, list, get, update, delete)
   a1. Add the `@modelcontextprotocol/server` dependency
   a2. `mcpServer(db)` with `save_experience` only
   a3. Test harness: in-memory MCP client (dev dependency) and `save_experience` tests
   a4. `list_experiences` and `get_experience`, with read-only hints, and tests
   a5. `update_experience` and tests
   a6. `delete_experience`, with a destructive hint, and tests
   a7. `serveMcp(databaseUrl)`: serve over stdio
   a8. `scripts/start-mcp.ts` and `pnpm start:mcp`: start Postgres, then serve
   a9. `.mcp.json`; check that stdout carries only protocol messages
   a10. Update `CLAUDE.md` layout and commands
   b. Ongoing capture skill: propose, refine, save only what's approved
   c. Backup and restore for the real data
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
8. Hosting
