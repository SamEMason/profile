import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod";
import type { Database } from "#src/db/client.js";
import { NewExperience, UpdatedExperience } from "#src/domain/experience.js";
import {
  deleteExperience,
  getExperience,
  listExperiences,
  saveExperience,
  updateExperience,
} from "#src/services/experience.js";
import { resolveProfile } from "#src/services/profile.js";

/**
 * A tool result the agent reads: the value as indented JSON text.
 *
 * @param value - What the tool returns, e.g. a saved experience.
 * @returns A result with one text block.
 */
const jsonResult = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

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
 * @returns The server, with `save_experience`, `list_experiences`,
 *   `get_experience`, `update_experience` and `delete_experience` registered.
 */
export const mcpServer = (db: Database): McpServer => {
  const server = new McpServer({ name: "profile", version: "0.1.0" });

  /**
   * Runs a tool's work for the current profile and returns its result as JSON.
   * Every tool goes through this, so none can forget which profile it acts on.
   *
   * @param work - The tool's work, given the profile's id, e.g.
   *   `(profileId) => listExperiences(db, profileId)`.
   * @returns The tool result the agent reads.
   */
  const respond = async (work: (profileId: string) => Promise<unknown>) => {
    const { id: profileId } = await resolveProfile(db);
    return jsonResult(await work(profileId));
  };

  server.registerTool(
    "save_experience",
    {
      description:
        "Save a new experience to the profile. Only call this after the user has approved the record.",
      inputSchema: NewExperience,
    },
    async (input) =>
      respond((profileId) => saveExperience(db, profileId, input)),
  );

  server.registerTool(
    "list_experiences",
    {
      description: "List the profile's experiences, newest first.",
      annotations: { readOnlyHint: true },
    },
    async () => respond((profileId) => listExperiences(db, profileId)),
  );

  server.registerTool(
    "get_experience",
    {
      description: "Get one of the profile's experiences by its id.",
      inputSchema: z.strictObject({
        id: z.string().describe("The experience's id, from list_experiences"),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => respond((profileId) => getExperience(db, profileId, id)),
  );

  server.registerTool(
    "update_experience",
    {
      description:
        "Change some fields of one of the profile's experiences. Fields left out stay as they are. Only call this after the user has approved the change.",
      inputSchema: z.strictObject({
        id: z.string().describe("The experience's id, from list_experiences"),
        changes: UpdatedExperience,
      }),
    },
    async ({ id, changes }) =>
      respond((profileId) => updateExperience(db, profileId, id, changes)),
  );

  server.registerTool(
    "delete_experience",
    {
      description:
        "Delete one of the profile's experiences and return what was deleted. Only call this after the user has confirmed the deletion.",
      inputSchema: z.strictObject({
        id: z.string().describe("The experience's id, from list_experiences"),
      }),
      annotations: { destructiveHint: true },
    },
    async ({ id }) =>
      respond((profileId) => deleteExperience(db, profileId, id)),
  );

  return server;
};
