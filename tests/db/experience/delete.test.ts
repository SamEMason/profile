import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, inject, it } from "vitest";
import { connectDatabase } from "#src/db/client.js";
import { experience } from "#src/db/schema.js";
import { NotFoundError } from "#src/domain/errors.js";
import { deleteExperience, saveExperience } from "#src/services/experience.js";
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

describe("deleteExperience", () => {
  it("deletes the experience and returns it", async () => {
    const { id: profileId } = await resolveProfile(db);
    const saved = await saveExperience(db, profileId, input);

    expect(await deleteExperience(db, profileId, saved.id)).toEqual(saved);
    expect(await db.select().from(experience)).toEqual([]);
  });

  it("leaves the profile's other experiences", async () => {
    const { id: profileId } = await resolveProfile(db);
    const kept = await saveExperience(db, profileId, input);
    const removed = await saveExperience(db, profileId, {
      ...input,
      description: "Remove me",
    });

    await deleteExperience(db, profileId, removed.id);

    expect(await db.select().from(experience)).toEqual([kept]);
  });

  it("throws NotFoundError for an unknown id", async () => {
    const { id: profileId } = await resolveProfile(db);

    await expect(
      deleteExperience(db, profileId, randomUUID()),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError for an id that isn't a UUID", async () => {
    const { id: profileId } = await resolveProfile(db);

    await expect(
      deleteExperience(db, profileId, "not-a-uuid"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
