import { createSelectSchema } from "drizzle-orm/zod";
import type * as z from "zod";
import { profile } from "../db/schema.js";

/** A user's profile as stored, derived from the `profile` table. */
export const Profile = createSelectSchema(profile);

export type Profile = z.infer<typeof Profile>;
