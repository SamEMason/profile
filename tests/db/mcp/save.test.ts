import { describe, expect, it } from "vitest";
import { experience } from "#src/db/schema.js";
import { sampleExperience } from "#tests/db/fixtures.js";
import { toolText, useMcpClient } from "#tests/db/mcp/client.js";

const mcp = useMcpClient();

describe("save_experience", () => {
  it("saves the experience and returns it as JSON", async () => {
    const result = await mcp.client.callTool({
      name: "save_experience",
      arguments: sampleExperience,
    });

    expect(result.isError).toBeFalsy();
    const [saved] = await mcp.db.select().from(experience);
    expect(saved).toMatchObject(sampleExperience);
    expect(JSON.parse(toolText(result))).toEqual(
      JSON.parse(JSON.stringify(saved)),
    );
  });

  it("rejects invalid input as a tool error and saves nothing", async () => {
    const result = await mcp.client.callTool({
      name: "save_experience",
      arguments: { ...sampleExperience, description: "" },
    });

    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^Input validation error/);
    expect(await mcp.db.select().from(experience)).toEqual([]);
  });
});
