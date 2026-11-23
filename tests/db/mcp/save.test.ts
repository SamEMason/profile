import type { Client } from "@modelcontextprotocol/client";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  inject,
  it,
} from "vitest";
import { connectDatabase } from "#src/db/client.js";
import { experience } from "#src/db/schema.js";
import { sampleExperience } from "#tests/db/fixtures.js";
import { connectMcpClient, toolText } from "#tests/db/mcp/client.js";
import { resetDatabase } from "#tests/db/reset.js";

const db = connectDatabase(inject("databaseUrl"));
let client: Client;

beforeEach(async () => {
  await resetDatabase(db);
  client = await connectMcpClient(db);
});

afterEach(async () => {
  await client.close();
});

afterAll(async () => {
  await db.$client.end();
});

describe("save_experience", () => {
  it("saves the experience and returns it as JSON", async () => {
    const result = await client.callTool({
      name: "save_experience",
      arguments: sampleExperience,
    });

    expect(result.isError).toBeFalsy();
    const [saved] = await db.select().from(experience);
    expect(saved).toMatchObject(sampleExperience);
    expect(JSON.parse(toolText(result))).toEqual(
      JSON.parse(JSON.stringify(saved)),
    );
  });

  it("rejects invalid input as a tool error and saves nothing", async () => {
    const result = await client.callTool({
      name: "save_experience",
      arguments: { ...sampleExperience, description: "" },
    });

    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^Input validation error/);
    expect(await db.select().from(experience)).toEqual([]);
  });
});
