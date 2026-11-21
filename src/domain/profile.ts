import * as z from "zod";

/** A user's profile. */
export const Profile = z.object({
  id: z.string(),
  createdAt: z.date(),
});

export type Profile = z.infer<typeof Profile>;
