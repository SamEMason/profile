/**
 * Creates the `profile` and `experience` tables.
 *
 * SQLite has no list or date types, so:
 * - `skills` is stored as JSON text, e.g. `'["TypeScript","SQL"]'`.
 * - `created_at` is stored as ISO text, e.g. `'2026-11-20T14:00:00.000Z'`.
 */
export const initialTables = `
  CREATE TABLE profile (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL
  ) STRICT;

  CREATE TABLE experience (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profile(id),
    description TEXT NOT NULL,
    skills TEXT NOT NULL,
    project TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL
  ) STRICT;
`;
