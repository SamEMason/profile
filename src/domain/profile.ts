import type { Experience } from "./experience.js";

export type Profile = {
  id: string;
  createdAt: Date;
  experiences: Experience[];
};
