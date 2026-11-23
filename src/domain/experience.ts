import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import * as z from "zod";
import { experience } from "#src/db/schema.js";

/** An experience as stored, derived from the `experience` table. */
export const Experience = createSelectSchema(experience);

export type Experience = z.infer<typeof Experience>;

/**
 * What a caller (such as the MCP tool) provides to save an experience.
 *
 * - The database fills in `id`, `createdAt` and `updatedAt`, and the service sets
 *   `profileId`, so callers can't supply them.
 * - Text fields must be non-empty after trimming, and `skills` needs at least one item.
 * - Unknown keys are rejected rather than silently dropped, so a field the
 *   agent thought it saved can't go missing unnoticed.
 */
export const NewExperience = z.strictObject(
  createInsertSchema(experience, {
    description: (schema) => schema.trim().min(1),
    skills: (schema) => schema.min(1),
    project: (schema) => schema.trim().min(1),
    source: (schema) => schema.trim().min(1),
  }).omit({ id: true, profileId: true, createdAt: true, updatedAt: true })
    .shape,
);

export type NewExperience = z.infer<typeof NewExperience>;

/**
 * What a caller provides to change an experience: any of the `NewExperience`
 * fields, with the same rules (trimmed, non-empty, no unknown keys).
 * At least one field is required, since an empty change is almost certainly a mistake.
 */
export const UpdatedExperience = NewExperience.partial().refine(
  (changes) => Object.values(changes).some((value) => value !== undefined),
  { message: "Provide at least one field to change." },
);

export type UpdatedExperience = z.infer<typeof UpdatedExperience>;
