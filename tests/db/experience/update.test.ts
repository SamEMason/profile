import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, inject, it } from "vitest";
import { connectDatabase } from "#src/db/client.js";
import { experience } from "#src/db/schema.js";
import { NotFoundError, ValidationError } from "#src/domain/errors.js";
import { saveExperience, updateExperience } from "#src/services/experience.js";
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

describe("updateExperience", () => {
  it("changes only the fields passed", async () => {
    const { id: profileId } = await resolveProfile(db);
    const saved = await saveExperience(db, profileId, sampleExperience);

    const updated = await updateExperience(db, profileId, saved.id, {
      skills: ["Docker", "Colima"],
    });

    expect(updated).toMatchObject({
      ...sampleExperience,
      skills: ["Docker", "Colima"],
    });
    expect(await db.select().from(experience)).toEqual([updated]);
  });

  it("moves updatedAt forward and keeps createdAt", async () => {
    const { id: profileId } = await resolveProfile(db);
    const then = new Date("2026-01-01");
    const [saved] = await db
      .insert(experience)
      .values({
        ...sampleExperience,
        profileId,
        createdAt: then,
        updatedAt: then,
      })
      .returning();
    if (!saved) throw new Error("Inserting the experience returned no row.");

    const updated = await updateExperience(db, profileId, saved.id, {
      project: "Profile v2",
    });

    expect(updated.createdAt).toEqual(then);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(then.getTime());
  });

  it("trims stray spaces", async () => {
    const { id: profileId } = await resolveProfile(db);
    const saved = await saveExperience(db, profileId, sampleExperience);

    const updated = await updateExperience(db, profileId, saved.id, {
      project: "  Profile v2  ",
    });

    expect(updated.project).toBe("Profile v2");
  });

  it.each(invalidFields)(
    "rejects %s and changes nothing",
    async (_name, fields) => {
      const { id: profileId } = await resolveProfile(db);
      const saved = await saveExperience(db, profileId, sampleExperience);

      await expect(
        updateExperience(db, profileId, saved.id, fields),
      ).rejects.toBeInstanceOf(ValidationError);
      expect(await db.select().from(experience)).toEqual([saved]);
    },
  );

  it("rejects an empty change", async () => {
    const { id: profileId } = await resolveProfile(db);
    const saved = await saveExperience(db, profileId, sampleExperience);

    await expect(
      updateExperience(db, profileId, saved.id, {}),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws NotFoundError for an unknown id", async () => {
    const { id: profileId } = await resolveProfile(db);

    await expect(
      updateExperience(db, profileId, randomUUID(), { project: "x" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError for an id that isn't a UUID", async () => {
    const { id: profileId } = await resolveProfile(db);

    await expect(
      updateExperience(db, profileId, "not-a-uuid", { project: "x" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
