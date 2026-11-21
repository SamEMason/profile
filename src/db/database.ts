import { DatabaseSync } from "node:sqlite";
import { MIGRATIONS } from "./migrations/index.js";

/**
 * Runs every migration the database hasn't had yet, each in its own transaction.
 *
 * The database's `user_version` (a number SQLite keeps in the file header, starting
 * at 0) records how many migrations have run. A failed migration is rolled back, so
 * the file is never left half-changed.
 *
 * @param db - The open database connection.
 */
const migrate = (db: DatabaseSync): void => {
  const { user_version } = db.prepare("PRAGMA user_version").get() as {
    user_version: number;
  };

  for (const [index, sql] of MIGRATIONS.entries()) {
    if (index < user_version) continue;

    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.exec(`PRAGMA user_version = ${index + 1}`);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
};

/**
 * Opens the SQLite database and brings its tables up to date.
 *
 * @param path - File path of the database, e.g. `"profile.db"`, or `":memory:"`
 *   for a throwaway in-memory database (useful in tests).
 * @returns The open database connection.
 */
export const openDatabase = (path: string): DatabaseSync => {
  const db = new DatabaseSync(path);
  migrate(db);
  return db;
};
