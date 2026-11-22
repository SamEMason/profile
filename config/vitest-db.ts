import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Database tests in tests/db/, run by `pnpm test:db` against a throwaway
 * Postgres (compose.test.yml). Files run one at a time because they share
 * one database.
 */
export default defineConfig({
  test: {
    root: fileURLToPath(new URL("..", import.meta.url)),
    include: ["tests/db/**/*.test.ts"],
    fileParallelism: false,
  },
});
