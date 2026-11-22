import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { TestProject } from "vitest/node";
import { testDatabase } from "../../config/vitest-db.js";
import { runCompose } from "../../scripts/lib/compose.js";
import { connectDatabase } from "../../src/db/client.js";

/** The test database's compose file, resolved from this file so it works from any folder. */
const COMPOSE_FILE = fileURLToPath(
  new URL("../../compose.test.yml", import.meta.url),
);

/** The migrations folder, resolved from this file so it works from any folder. */
const MIGRATIONS_FOLDER = fileURLToPath(
  new URL("../../migrations", import.meta.url),
);

/**
 * Runs a Docker Compose command against compose.test.yml.
 *
 * @param args - Compose arguments, e.g. `["up", "-d", "--wait"]`.
 * @throws If Docker can't be run, or the command fails (with Docker's output and a hint).
 */
const runTestCompose = (args: string[]): void => {
  const result = runCompose(["-f", COMPOSE_FILE, ...args]);

  if (result.error) {
    throw new Error(
      "Couldn't run docker. Is Docker (Colima) installed and running?",
      { cause: result.error },
    );
  }
  if (!result.ok) {
    throw new Error(
      `docker compose ${args.join(" ")} failed. Is Colima running? Is port 5433 free?\n\n${result.stdout}${result.stderr}`,
    );
  }
};

/** Removes the test database's container and network, along with its in-memory data. */
const removeTestDatabase = (): void => {
  runTestCompose(["down", "-v"]);
};

/** Leaves the test database running and prints how to inspect and remove it. */
const keepTestDatabase = (): void => {
  console.log(
    [
      "",
      "Test database kept (testDatabase.keepAfterRun in config/vitest-db.ts).",
      "  Inspect: docker compose -f compose.test.yml exec db psql -U test -d profile_test",
      "  Remove:  docker compose -f compose.test.yml down -v",
    ].join("\n"),
  );
};

/** Applies every migration in migrations/ to the test database. */
const migrateTestDatabase = async (): Promise<void> => {
  const db = connectDatabase(testDatabase.url);
  try {
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await db.$client.end();
  }
};

/**
 * Vitest global setup for the DB tests. Starts a fresh throwaway Postgres,
 * migrates it, and passes its URL to tests (read it with `inject("databaseUrl")`).
 *
 * @param project - The Vitest project, used to provide the URL to tests.
 * @returns The teardown, which removes the test database after all tests
 *   finish, or keeps it if `testDatabase.keepAfterRun` is set.
 */
const setup = async (project: TestProject): Promise<() => void> => {
  // Start clean, even if an interrupted or kept run left a container behind.
  removeTestDatabase();
  runTestCompose(["up", "-d", "--wait"]);

  try {
    await migrateTestDatabase();
  } catch (error) {
    removeTestDatabase();
    throw error;
  }

  project.provide("databaseUrl", testDatabase.url);
  return testDatabase.keepAfterRun ? keepTestDatabase : removeTestDatabase;
};

export default setup;

declare module "vitest" {
  export interface ProvidedContext {
    /** Connection string for the migrated test database. */
    databaseUrl: string;
  }
}
