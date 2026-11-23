import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import type { Database } from "#src/db/client.js";
import { mcpServer } from "#src/mcp/server.js";

/** What `client.callTool` resolves to. */
type ToolResult = Awaited<ReturnType<Client["callTool"]>>;

/**
 * Connects a test MCP client to a new `mcpServer(db)`, in the same process.
 *
 * The two ends are linked in memory, so calls go through the real MCP protocol
 * (argument validation, error conversion) without stdio or a network.
 *
 * @param db - The test database the server's tools use.
 * @returns The connected client. Close it with `await client.close()`.
 */
export const connectMcpClient = async (db: Database): Promise<Client> => {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();

  await mcpServer(db).connect(serverTransport);

  const client = new Client({ name: "profile-tests", version: "0.1.0" });
  await client.connect(clientTransport);
  return client;
};

/**
 * The text a tool returned, which is what the agent reads.
 *
 * @param result - A `callTool` result, e.g.
 *   `{ content: [{ type: "text", text: "{ … }" }] }`.
 * @returns The first content block's text.
 * @throws If the first block isn't text.
 */
export const toolText = (result: ToolResult): string => {
  const [first] = result.content;
  if (first?.type !== "text") {
    throw new Error("Expected the tool to return a text block.");
  }
  return first.text;
};
