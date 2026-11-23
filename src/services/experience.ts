import { desc, eq } from "drizzle-orm";
import type { Database } from "#src/db/client.js";
import { experience } from "#src/db/schema.js";
import { NotFoundError, ValidationError } from "#src/domain/errors.js";
import {
  UpdatedExperience,
  NewExperience,
  type Experience,
} from "#src/domain/experience.js";
import { isUuid, ownedExperience } from "#src/services/lib/lookup.js";

/**
 * Validates an experience and saves it to a profile.
 *
 * The input is checked against `NewExperience` before anything is written, so
 * bad input saves nothing. Stray spaces are trimmed, and empty fields or
 * unknown keys are rejected.
 *
 * @param db - The open database connection.
 * @param profileId - The profile to save to, usually from `resolveProfile`.
 * @param input - The proposed experience, e.g.
 *   `{ description: "Set up Postgres in Docker", skills: ["Docker"], project: "Profile", source: "conversation" }`.
 * @returns The saved experience, with its `id`, `profileId`, `createdAt` and `updatedAt`.
 * @throws {ValidationError} If the input doesn't match `NewExperience`.
 * @throws If `profileId` doesn't match a profile (the foreign key rejects it).
 */
export const saveExperience = async (
  db: Database,
  profileId: string,
  input: unknown,
): Promise<Experience> => {
  const parsed = NewExperience.safeParse(input);
  if (!parsed.success) throw new ValidationError(parsed.error);

  const [saved] = await db
    .insert(experience)
    .values({ ...parsed.data, profileId })
    .returning();
  if (!saved) throw new Error("Saving the experience returned no row.");
  return saved;
};

/**
 * Lists a profile's experiences, newest first.
 *
 * @param db - The open database connection.
 * @param profileId - The profile whose experiences to list.
 * @returns The experiences, or `[]` if the profile has none (or doesn't exist).
 */
export const listExperiences = async (
  db: Database,
  profileId: string,
): Promise<Experience[]> =>
  db
    .select()
    .from(experience)
    .where(eq(experience.profileId, profileId))
    .orderBy(desc(experience.createdAt));

/**
 * Gets one of a profile's experiences by its id.
 *
 * An id that isn't a UUID can't match anything, so it's treated as not found
 * rather than passed to Postgres, which would reject it with a confusing error.
 *
 * @param db - The open database connection.
 * @param profileId - The profile the experience must belong to.
 * @param id - The experience's id, e.g. `"3f9c…"`.
 * @returns The experience.
 * @throws {NotFoundError} If no experience with that id belongs to the profile.
 */
export const getExperience = async (
  db: Database,
  profileId: string,
  id: string,
): Promise<Experience> => {
  const [found] = isUuid(id)
    ? await db.select().from(experience).where(ownedExperience(profileId, id))
    : [];

  if (!found) throw new NotFoundError(`No experience with id "${id}".`);
  return found;
};

/**
 * Changes some fields of one of a profile's experiences.
 *
 * The changes are checked against `UpdatedExperience` before anything is written,
 * so bad input changes nothing. Fields that aren't passed are left as they are,
 * and `updatedAt` is set to now by the column's `$onUpdate`.
 *
 * @param db - The open database connection.
 * @param profileId - The profile the experience must belong to.
 * @param id - The experience's id.
 * @param changes - The fields to change, e.g. `{ skills: ["Docker", "Colima"] }`.
 * @returns The updated experience.
 * @throws {ValidationError} If the changes don't match `UpdatedExperience`.
 * @throws {NotFoundError} If no experience with that id belongs to the profile.
 */
export const updateExperience = async (
  db: Database,
  profileId: string,
  id: string,
  changes: unknown,
): Promise<Experience> => {
  const parsed = UpdatedExperience.safeParse(changes);
  if (!parsed.success) throw new ValidationError(parsed.error);

  const [updated] = isUuid(id)
    ? await db
        .update(experience)
        .set(parsed.data)
        .where(ownedExperience(profileId, id))
        .returning()
    : [];

  if (!updated) throw new NotFoundError(`No experience with id "${id}".`);
  return updated;
};

/**
 * Deletes one of a profile's experiences.
 *
 * @param db - The open database connection.
 * @param profileId - The profile the experience must belong to.
 * @param id - The experience's id.
 * @returns The deleted experience, e.g. for confirming what was removed.
 * @throws {NotFoundError} If no experience with that id belongs to the profile.
 */
export const deleteExperience = async (
  db: Database,
  profileId: string,
  id: string,
): Promise<Experience> => {
  const [deleted] = isUuid(id)
    ? await db
        .delete(experience)
        .where(ownedExperience(profileId, id))
        .returning()
    : [];

  if (!deleted) throw new NotFoundError(`No experience with id "${id}".`);
  return deleted;
};
