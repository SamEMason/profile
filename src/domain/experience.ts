import * as z from "zod";

/** A single captured experience. */
export const Experience = z.object({
  id: z.string(),
  profileId: z.string(),
  description: z.string(),
  skills: z.array(z.string()),
  project: z.string(),
  source: z.string(),
  createdAt: z.date(),
});

export type Experience = z.infer<typeof Experience>;
