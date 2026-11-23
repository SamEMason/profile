import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, inject, it } from "vitest";
import { connectDatabase } from "#src/db/client.js";
import { NotFoundError } from "#src/domain/errors.js";
import { getExperience, saveExperience } from "#src/services/experience.js";
import { resolveProfile } from "#src/services/profile.js";
import { sampleExperience } from "#tests/db/fixtures.js";
import { resetDatabase } from "#tests/db/reset.js";

const db = connectDatabase(inject("databaseUrl"));

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await db.$client.end();
});

describe("getExperience", () => {
  it("returns the experience with that id", async () => {
    const { id: profileId } = await resolveProfile(db);
    const saved = await saveExperience(db, profileId, sampleExperience);

    expect(await getExperience(db, profileId, saved.id)).toEqual(saved);
  });

  it("throws NotFoundError for an unknown id", async () => {
    const { id: profileId } = await resolveProfile(db);

    await expect(
      getExperience(db, profileId, randomUUID()),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError for an id that isn't a UUID", async () => {
    const { id: profileId } = await resolveProfile(db);

    await expect(
      getExperience(db, profileId, "not-a-uuid"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
