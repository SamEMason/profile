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
import { saveExperience } from "#src/services/experience.js";
import { resolveProfile } from "#src/services/profile.js";
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

describe("list_experiences", () => {
  it("returns the profile's experiences as JSON", async () => {
    const { id: profileId } = await resolveProfile(db);
    const saved = await saveExperience(db, profileId, sampleExperience);

    const result = await client.callTool({ name: "list_experiences" });

    expect(result.isError).toBeFalsy();
    expect(JSON.parse(toolText(result))).toEqual(
      JSON.parse(JSON.stringify([saved])),
    );
  });
});
