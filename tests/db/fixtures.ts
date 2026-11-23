import { randomUUID } from "node:crypto";

/** A valid experience's fields, minus the profile it belongs to. */
export const sampleExperience = {
  description: "Set up Postgres in Docker",
  skills: ["Docker", "PostgreSQL"],
  project: "Profile",
  source: "conversation",
};

/** The text fields that must be non-empty after trimming. */
const textFields = ["description", "project", "source"] as const;

/**
 * Fields that make an experience invalid, each with a name for the test title.
 * Save tests merge each one into `sampleExperience`; update tests pass it on
 * its own, so a partial update is held to the same rules as a save.
 */
export const invalidFields: [name: string, fields: Record<string, unknown>][] =
  [
    ...textFields.flatMap((field): [string, Record<string, unknown>][] => [
      [`empty ${field}`, { [field]: "" }],
      [`whitespace-only ${field}`, { [field]: "   " }],
    ]),
    ["no skills", { skills: [] }],
    ["an empty skill", { skills: [""] }],
    ["a whitespace-only skill", { skills: ["Docker", "   "] }],
    ["an unknown key", { notes: "x" }],
    ["an id", { id: randomUUID() }],
    ["a profileId", { profileId: randomUUID() }],
    ["a createdAt", { createdAt: new Date() }],
    ["an updatedAt", { updatedAt: new Date() }],
  ];
