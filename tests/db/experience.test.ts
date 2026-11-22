import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, inject, it } from "vitest";
import { connectDatabase } from "../../src/db/client.js";
import { experience, profile } from "../../src/db/schema.js";
import { NotFoundError, ValidationError } from "../../src/domain/errors.js";
import {
  getExperience,
  listExperiences,
  saveExperience,
} from "../../src/services/experience.js";
import { resolveProfile } from "../../src/services/profile.js";
import { resetDatabase } from "./reset.js";

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

  it("leaves out other profiles' experiences", async () => {
    const { id: profileId } = await resolveProfile(db);
    const [other] = await db.insert(profile).values({}).returning();
    if (!other) throw new Error("Creating the other profile returned no row.");
    await saveExperience(db, profileId, input);
    await saveExperience(db, other.id, { ...input, description: "Not mine" });

    const listed = await listExperiences(db, profileId);

    expect(listed.map((e) => e.description)).toEqual([input.description]);
  });
});

describe("getExperience", () => {
  it("returns the experience with that id", async () => {
    const { id: profileId } = await resolveProfile(db);
    const saved = await saveExperience(db, profileId, input);

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

  it("throws NotFoundError for another profile's experience", async () => {
    const { id: profileId } = await resolveProfile(db);
    const [other] = await db.insert(profile).values({}).returning();
    if (!other) throw new Error("Creating the other profile returned no row.");
    const theirs = await saveExperience(db, other.id, input);

    await expect(
      getExperience(db, profileId, theirs.id),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
