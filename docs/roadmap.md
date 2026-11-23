# Roadmap

1. Capture foundation
   a. MCP server over the experience services (save, list, get, update, delete)
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
