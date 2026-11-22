import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Unit tests: everything except tests/db/, so `pnpm test` (and the pre-commit hook) never needs Docker. */
export default defineConfig({
  test: {
    root: fileURLToPath(new URL("..", import.meta.url)),
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/db/**"],
  },
});
