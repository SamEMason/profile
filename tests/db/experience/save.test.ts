import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, inject, it } from "vitest";
import { connectDatabase } from "#src/db/client.js";
import { experience } from "#src/db/schema.js";
import { ValidationError } from "#src/domain/errors.js";
import { saveExperience } from "#src/services/experience.js";
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

describe("saveExperience", () => {
  it("saves the experience and returns it", async () => {
    const { id: profileId } = await resolveProfile(db);

    const saved = await saveExperience(db, profileId, input);

    expect(saved).toMatchObject({ ...input, profileId });
    expect(saved.id).toEqual(expect.any(String));
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(await db.select().from(experience)).toEqual([saved]);
  });

  it("trims stray spaces before saving", async () => {
    const { id: profileId } = await resolveProfile(db);

    const saved = await saveExperience(db, profileId, {
      ...input,
      description: "  Set up Postgres in Docker  ",
    });

    expect(saved.description).toBe("Set up Postgres in Docker");
  });

  it("rejects bad input and saves nothing", async () => {
    const { id: profileId } = await resolveProfile(db);

    await expect(
      saveExperience(db, profileId, { ...input, skills: [] }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(await db.select().from(experience)).toEqual([]);
  });

  it("fails for an unknown profile", async () => {
    await expect(saveExperience(db, randomUUID(), input)).rejects.toThrow();
  });
});
