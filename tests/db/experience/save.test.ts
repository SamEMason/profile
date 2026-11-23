import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, inject, it } from "vitest";
import { connectDatabase } from "#src/db/client.js";
import { experience } from "#src/db/schema.js";
import { ValidationError } from "#src/domain/errors.js";
import { saveExperience } from "#src/services/experience.js";
import { resolveProfile } from "#src/services/profile.js";
import { invalidFields, sampleExperience } from "#tests/db/fixtures.js";
import { resetDatabase } from "#tests/db/reset.js";

const db = connectDatabase(inject("databaseUrl"));

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await db.$client.end();
});

describe("saveExperience", () => {
  it("saves the experience and returns it", async () => {
    const { id: profileId } = await resolveProfile(db);

    const saved = await saveExperience(db, profileId, sampleExperience);

    expect(saved).toMatchObject({ ...sampleExperience, profileId });
    expect(saved.id).toEqual(expect.any(String));
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(await db.select().from(experience)).toEqual([saved]);
  });

  it("trims stray spaces before saving", async () => {
    const { id: profileId } = await resolveProfile(db);

    const saved = await saveExperience(db, profileId, {
      ...sampleExperience,
      description: "  Set up Postgres in Docker  ",
      skills: ["  Docker ", "PostgreSQL  "],
    });

    expect(saved.description).toBe("Set up Postgres in Docker");
    expect(saved.skills).toEqual(["Docker", "PostgreSQL"]);
  });

  it.each(invalidFields)(
    "rejects %s and saves nothing",
    async (_name, fields) => {
      const { id: profileId } = await resolveProfile(db);

      await expect(
        saveExperience(db, profileId, { ...sampleExperience, ...fields }),
      ).rejects.toBeInstanceOf(ValidationError);
      expect(await db.select().from(experience)).toEqual([]);
    },
  );

  it("fails for an unknown profile", async () => {
    await expect(
      saveExperience(db, randomUUID(), sampleExperience),
    ).rejects.toThrow();
  });
});
