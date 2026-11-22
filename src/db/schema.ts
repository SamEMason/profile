import { snakeCase, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * A user's profile. This table is the source of truth for the Profile shape;
 * zod schemas are derived from it with `drizzle-orm/zod`.
 */
export const profile = snakeCase.table("profile", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * A single captured experience, linked to the profile it belongs to. This
 * table is the source of truth for the Experience shape.
 */
export const experience = snakeCase.table("experience", {
  id: uuid().primaryKey().defaultRandom(),
  profileId: uuid()
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  description: text().notNull(),
  skills: text().array().notNull(),
  project: text().notNull(),
  source: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
