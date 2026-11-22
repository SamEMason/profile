import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import type * as z from "zod";
import { experience } from "../db/schema.js";

/** An experience as stored, derived from the `experience` table. */
export const Experience = createSelectSchema(experience);

export type Experience = z.infer<typeof Experience>;

/**
 * What a caller (such as the MCP tool) provides to save an experience.
 * The database fills in `id` and `createdAt`, and the service sets `profileId`,
 * so callers can't supply them.
 */
export const NewExperience = createInsertSchema(experience).omit({
  id: true,
  profileId: true,
  createdAt: true,
});

export type NewExperience = z.infer<typeof NewExperience>;
