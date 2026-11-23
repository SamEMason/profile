---
title: Profile Capture Foundation — Roadmap Expansion
created: 2026-11-23
status: proposed
---

# Profile Capture Foundation — Roadmap Expansion

## Purpose

Expand the near-term tasks in `docs/roadmap.md` without changing their sequence or prematurely designing later stages. These are proposed implementation details and acceptance criteria for discussion, not approved roadmap changes.

## 1a. MCP server over the experience services

Keep the existing a1–a10 tasks and add acceptance criteria where useful.

### a1. MCP dependency

- Verify the current MCP SDK package name and version before installation.
- Establish where the server entry point belongs in the project.

### a2. `mcpServer(db)` with `save_experience`

- Define tool input and output schemas.
- Translate domain validation failures into understandable tool errors.
- Use the existing profile resolution behavior rather than introducing authentication early.

### a3. In-memory MCP client and save tests

- Exercise the MCP tool through an in-memory client, not only the underlying service.
- Cover successful saves, invalid input, and returned identifiers.

### a4. `list_experiences` and `get_experience`

- Specify response structures and empty-list behavior.
- Handle missing records clearly.
- Verify read-only tool annotations and test both operations through the MCP interface.

### a5. `update_experience`

- Test partial updates, invalid fields, missing records, and preservation of fields not supplied.

### a6. `delete_experience`

- Test successful deletion and missing-record behavior.
- Verify the destructive tool annotation.

### a7–a9. stdio transport and client configuration

- Verify server startup and a real client connection.
- Ensure stdout contains protocol messages only; diagnostics belong on stderr.
- Check startup failures and error reporting.

### a10. Documentation

- Update `CLAUDE.md` with the implemented layout and commands.
- Document starting the server, connecting a client, and running MCP tests.

## 1b. Ongoing capture skill

Proposed interaction:

1. Identify a potentially useful experience during a conversation.
2. Propose a structured record using the fields currently supported by the experience model.
3. Allow the user to refine, approve, or reject it.
4. Save only after explicit approval.
5. Confirm what was saved.

Design questions to settle:

- How should the skill recognize possible duplicates?
- When should it propose updating an existing experience rather than creating a new one?
- How should it handle incomplete details without inventing information?

## 1c. Backup and restore

Before accumulating important real data, specify:

- How backups are created and where they are stored.
- How restoration is performed and tested.
- How to prevent accidental overwriting of the active database.

## 2. Authentication — boundary for the prototype

The current roadmap places authentication after the capture foundation. Keep that sequence for a local, single-user prototype. Explicitly document that the initial MCP server and capture skill rely on the temporary profile resolver, rather than prematurely implementing multi-user behavior.

## Recommended order

MCP server → Ongoing capture skill → Backup and restore → Authentication.

Focus implementation first on exposing the already-existing experience services correctly through MCP. Discuss the capture skill's interaction design before implementation; it is the first point where Profile becomes useful through conversational capture.
