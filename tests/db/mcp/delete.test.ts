import { describe, expect, it } from "vitest";
import { experience } from "#src/db/schema.js";
import { saveExperience } from "#src/services/experience.js";
import { resolveProfile } from "#src/services/profile.js";
import { sampleExperience } from "#tests/db/fixtures.js";
import { toolText, useMcpClient } from "#tests/db/mcp/client.js";

const mcp = useMcpClient();

describe("delete_experience", () => {
  it("deletes the experience and returns it as JSON", async () => {
    const { id: profileId } = await resolveProfile(mcp.db);
    const saved = await saveExperience(mcp.db, profileId, sampleExperience);

    const result = await mcp.client.callTool({
      name: "delete_experience",
      arguments: { id: saved.id },
    });

    expect(result.isError).toBeFalsy();
    expect(await mcp.db.select().from(experience)).toEqual([]);
    expect(JSON.parse(toolText(result))).toEqual(
      JSON.parse(JSON.stringify(saved)),
    );
  });
});
