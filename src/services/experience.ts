import { desc, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { experience } from "../db/schema.js";
import { ValidationError } from "../domain/errors.js";
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
