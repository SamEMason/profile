import { McpServer } from "@modelcontextprotocol/server";
import type { Database } from "#src/db/client.js";
import { NewExperience } from "#src/domain/experience.js";
import { saveExperience } from "#src/services/experience.js";
import { resolveProfile } from "#src/services/profile.js";

/**
 * Builds the MCP server that exposes the experience services as tools.
 *
 * It isn't connected to a transport: `serveMcp` attaches stdio, and tests attach
 * an in-memory client.
 *
 * Errors need no handling here. The SDK turns anything a tool throws into an
 * `isError: true` result with the error's message as its text, so domain errors
 * (`ValidationError`, `NotFoundError`) reach the agent as written. It also
 * checks arguments against each tool's `inputSchema` before the tool runs.
 *
 * @param db - The open database connection the tools use.
 * @returns The server, with `save_experience` registered.
 */
export const mcpServer = (db: Database): McpServer => {
  const server = new McpServer({ name: "profile", version: "0.1.0" });

  server.registerTool(
    "save_experience",
    {
      description:
        "Save a new experience to the profile. Only call this after the user has approved the record.",
      inputSchema: NewExperience,
    },
    async (input) => {
      const { id: profileId } = await resolveProfile(db);
      const saved = await saveExperience(db, profileId, input);
      return {
        content: [{ type: "text", text: JSON.stringify(saved, null, 2) }],
      };
    },
  );

  return server;
};
