import * as z from "zod";
import { Experience } from "./experience.js";

/** A user's profile and the experiences captured for it. */
export const Profile = z.object({
  id: z.string(),
  createdAt: z.date(),
  experiences: z.array(Experience),
});

export type Profile = z.infer<typeof Profile>;
