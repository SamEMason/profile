import { sql } from "drizzle-orm";
import type { Database } from "#src/db/client.js";

/**
 * Empties every table, so each test starts from a known state.
 * Use it in `beforeEach` in DB test files.
 *
 * @param db - The open connection to the test database.
 */
export const resetDatabase = async (db: Database): Promise<void> => {
  await db.execute(sql`TRUNCATE profile, experience CASCADE`);
};
