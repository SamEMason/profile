import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { connectDatabase } from "#src/db/client.js";
import { mcpServer } from "#src/mcp/server.js";

/**
 * Serves the MCP tools over stdio, for a client such as Claude Code that
 * starts this process and talks to it through stdin and stdout.
 *
 * stdout carries only protocol messages from here on, so anything else must be
 * logged with `console.error`. The database connects lazily, on the first tool
 * call.
 *
 * @param databaseUrl - The Postgres connection string, e.g. `DATABASE_URL`.
 */
export const serveMcp = (databaseUrl: string): void => {
  const db = connectDatabase(databaseUrl);
  serveStdio(() => mcpServer(db));
};
