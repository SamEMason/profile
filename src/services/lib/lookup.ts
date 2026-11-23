import { and, eq, type SQL } from "drizzle-orm";
import * as z from "zod";
import { experience } from "#src/db/schema.js";

/**
 * Whether an id is a UUID. Ids that aren't can't match a row, so services
 * treat them as not found instead of letting Postgres reject the query.
 *
 * @param id - The id to check, e.g. `"not-a-uuid"` (false).
 * @returns `true` if `id` is a UUID.
 */
export const isUuid = (id: string): boolean => z.uuid().safeParse(id).success;

/**
 * The SQL condition matching one experience, only if it belongs to the profile.
 *
 * @param profileId - The profile the experience must belong to.
 * @param id - The experience's id.
 * @returns A `WHERE` condition for `experience`.
 */
export const ownedExperience = (
  profileId: string,
  id: string,
): SQL | undefined =>
  and(eq(experience.id, id), eq(experience.profileId, profileId));
