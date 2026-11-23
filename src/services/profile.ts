import type { Database } from "#src/db/client.js";
import { profile } from "#src/db/schema.js";
import type { Profile } from "#src/domain/profile.js";

/**
 * Finds the profile that services should act on, creating it on first use.
 *
 * Profile is single-user for now, so there is at most one profile; finding two
 * means something went wrong, and guessing which to use could attach records
 * to the wrong one. This is the one place that decides which profile: with
 * auth, it will look up the signed-in user's profile instead, and services
 * (which take a `profileId`) won't change.
 *
 * @param db - The open database connection.
 * @returns The profile, e.g. `{ id: "b2e4d8f1-…", createdAt: Date }`.
 * @throws If more than one profile exists.
 */
export const resolveProfile = async (db: Database): Promise<Profile> => {
  const profiles = await db.select().from(profile).limit(2);

  if (profiles.length > 1) {
    throw new Error(
      "Found more than one profile. Profile is single-user until auth is added, so remove the extra profile.",
    );
  }

  const [existing] = profiles;
  if (existing) return existing;

  const [created] = await db.insert(profile).values({}).returning();
  if (!created) throw new Error("Creating the profile returned no row.");
  return created;
};
