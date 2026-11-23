import { afterAll, beforeEach, describe, expect, inject, it } from "vitest";
import { connectDatabase } from "#src/db/client.js";
import { experience } from "#src/db/schema.js";
import { listExperiences } from "#src/services/experience.js";
import { resolveProfile } from "#src/services/profile.js";
import { resetDatabase } from "#tests/db/reset.js";

const db = connectDatabase(inject("databaseUrl"));

const input = {
  description: "Set up Postgres in Docker",
  skills: ["Docker", "PostgreSQL"],
  project: "Profile",
  source: "conversation",
};

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await db.$client.end();
});

describe("listExperiences", () => {
  it("returns an empty list when the profile has no experiences", async () => {
    const { id: profileId } = await resolveProfile(db);

    expect(await listExperiences(db, profileId)).toEqual([]);
  });

  it("returns the profile's experiences, newest first", async () => {
    const { id: profileId } = await resolveProfile(db);
    await db.insert(experience).values([
      {
        ...input,
        profileId,
        description: "Older",
        createdAt: new Date("2026-01-01"),
      },
      {
        ...input,
        profileId,
        description: "Newer",
        createdAt: new Date("2026-02-01"),
      },
    ]);

    const listed = await listExperiences(db, profileId);

    expect(listed.map((e) => e.description)).toEqual(["Newer", "Older"]);
  });
});
