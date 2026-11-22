import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Settings for the throwaway test database started by tests/db/setup.ts. */
export const testDatabase: { url: string; keepAfterRun: boolean } = {
  /** Connection string. Matches the credentials and port in compose.test.yml. */
  url: "postgresql://test:test@127.0.0.1:5433/profile_test",
  /**
   * Set to `true` to keep the database after a run, for inspecting the data
   * with psql. The next run still starts from a clean database.
   */
  keepAfterRun: false,
};

/**
 * Database tests in tests/db/, run by `pnpm test:db` against a throwaway
 * Postgres (compose.test.yml). Files run one at a time because they share
 * one database.
 */
export default defineConfig({
  test: {
    root: fileURLToPath(new URL("..", import.meta.url)),
    include: ["tests/db/**/*.test.ts"],
    globalSetup: ["tests/db/setup.ts"],
    fileParallelism: false,
  },
});
