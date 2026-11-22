import { and, desc, eq } from "drizzle-orm";
import * as z from "zod";
import type { Database } from "../db/client.js";
import { experience } from "../db/schema.js";
import { NotFoundError, ValidationError } from "../domain/errors.js";
import { NewExperience, type Experience } from "../domain/experience.js";

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
 * @returns The saved experience, with its `id`, `profileId` and `createdAt`.
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
  const isUuid = z.uuid().safeParse(id).success;

  const [found] = isUuid
    ? await db
        .select()
        .from(experience)
        .where(and(eq(experience.id, id), eq(experience.profileId, profileId)))
    : [];

  if (!found) throw new NotFoundError(`No experience with id "${id}".`);
  return found;
};
