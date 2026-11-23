import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, inject, it } from "vitest";
import { connectDatabase } from "#src/db/client.js";
import { experience, profile } from "#src/db/schema.js";
import { Experience } from "#src/domain/experience.js";
import { sampleExperience } from "#tests/db/fixtures.js";
import { resetDatabase } from "#tests/db/reset.js";

const db = connectDatabase(inject("databaseUrl"));

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await db.$client.end();
});

describe("migrations", () => {
  it("create the profile and experience tables", async () => {
    const result = await db.$client.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );

    expect(result.rows.map((row) => row.table_name)).toEqual([
      "experience",
      "profile",
    ]);
  });

  it("store an experience and return it intact", async () => {
    const [savedProfile] = await db.insert(profile).values({}).returning();
    if (!savedProfile) throw new Error("Inserting a profile returned no row");

    const [inserted] = await db
      .insert(experience)
      .values({ ...sampleExperience, profileId: savedProfile.id })
      .returning();
    if (!inserted) throw new Error("Inserting an experience returned no row");

    const [stored] = await db
      .select()
      .from(experience)
      .where(eq(experience.id, inserted.id));

    expect(stored).toMatchObject({
      ...sampleExperience,
      profileId: savedProfile.id,
    });
    expect(stored?.createdAt).toBeInstanceOf(Date);
    expect(stored?.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(Experience.safeParse(stored).success).toBe(true);
  });

  it("delete a profile's experiences when the profile is deleted", async () => {
    const [savedProfile] = await db.insert(profile).values({}).returning();
    if (!savedProfile) throw new Error("Inserting a profile returned no row");

    await db
      .insert(experience)
      .values({ ...sampleExperience, profileId: savedProfile.id });
    await db.delete(profile).where(eq(profile.id, savedProfile.id));

    const remaining = await db
      .select()
      .from(experience)
      .where(eq(experience.profileId, savedProfile.id));
    expect(remaining).toEqual([]);
  });

  it("reject an experience whose profile doesn't exist", async () => {
    await expect(
      db
        .insert(experience)
        .values({ ...sampleExperience, profileId: randomUUID() }),
    ).rejects.toThrow();
  });
});
