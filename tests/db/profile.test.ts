import { afterAll, beforeEach, describe, expect, inject, it } from "vitest";
import { connectDatabase } from "#src/db/client.js";
import { profile } from "#src/db/schema.js";
import { resolveProfile } from "#src/services/profile.js";
import { resetDatabase } from "#tests/db/reset.js";

const db = connectDatabase(inject("databaseUrl"));

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await db.$client.end();
});

describe("resolveProfile", () => {
  it("creates a profile on first use", async () => {
    const resolved = await resolveProfile(db);

    expect(await db.select().from(profile)).toEqual([resolved]);
  });

  it("returns the same profile on later calls", async () => {
    const first = await resolveProfile(db);
    const second = await resolveProfile(db);

    expect(second).toEqual(first);
    expect(await db.select().from(profile)).toHaveLength(1);
  });

  it("throws when more than one profile exists", async () => {
    await db.insert(profile).values([{}, {}]);

    await expect(resolveProfile(db)).rejects.toThrow("more than one profile");
  });
});
