import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { databaseConfig } from "../config.js";

/**
 * Connects to Postgres through a new connection pool. Connections open lazily,
 * on the first query.
 *
 * If an idle connection breaks (for example, the database restarts), the error
 * is logged to stderr instead of crashing the process; the next query opens a
 * new connection. Logs go to stderr because stdout is reserved for the MCP
 * stdio protocol.
 *
 * @param url - Connection string, e.g. `postgresql://user:pass@127.0.0.1:5432/profile`.
 *   The app passes `DATABASE_URL`; tests pass the test database's URL.
 * @returns The Drizzle database. Close its pool with `await db.$client.end()`
 *   when finished, for example at the end of a test run.
 */
export const connectDatabase = (url: string) => {
  const pool = new Pool({
    connectionString: url,
    connectionTimeoutMillis: databaseConfig.connectionTimeoutMs,
  });

  pool.on("error", (error) => {
    console.error("Postgres connection error:", error.message);
  });

  return drizzle({ client: pool });
};

/** A connected database, as returned by `connectDatabase`. Services take this as a parameter. */
export type Database = ReturnType<typeof connectDatabase>;
