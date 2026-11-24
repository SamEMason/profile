import { describe, expect, it } from "vitest";
import { experience } from "#src/db/schema.js";
import { saveExperience } from "#src/services/experience.js";
import { resolveProfile } from "#src/services/profile.js";
import { sampleExperience } from "#tests/db/fixtures.js";
import { toolText, useMcpClient } from "#tests/db/mcp/client.js";

const mcp = useMcpClient();

describe("update_experience", () => {
  it("updates the experience and returns it as JSON", async () => {
    const { id: profileId } = await resolveProfile(mcp.db);
    const saved = await saveExperience(mcp.db, profileId, sampleExperience);

    const result = await mcp.client.callTool({
      name: "update_experience",
      arguments: { id: saved.id, changes: { skills: ["Docker", "Colima"] } },
    });

    expect(result.isError).toBeFalsy();
    const [updated] = await mcp.db.select().from(experience);
    expect(updated?.skills).toEqual(["Docker", "Colima"]);
    expect(JSON.parse(toolText(result))).toEqual(
      JSON.parse(JSON.stringify(updated)),
    );
  });

  it("rejects invalid changes as a tool error and changes nothing", async () => {
    const { id: profileId } = await resolveProfile(mcp.db);
    const saved = await saveExperience(mcp.db, profileId, sampleExperience);

    const result = await mcp.client.callTool({
      name: "update_experience",
      arguments: { id: saved.id, changes: { description: "" } },
    });

    expect(result.isError).toBe(true);
    expect(toolText(result)).toMatch(/^Input validation error/);
    expect(await mcp.db.select().from(experience)).toEqual([saved]);
  });
});
