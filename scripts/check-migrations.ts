import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/** The project root, resolved from this file so the check works from any folder. */
const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));

/** drizzle-kit's dry-run result, e.g. `{ status: "no_changes", dialect: "postgresql" }`. */
type MigrationPlan = { status: string } & Record<string, unknown>;

/**
 * Asks drizzle-kit what a new migration would contain, without writing one
 * (`generate --explain`). Uses CLI flags instead of config/drizzle.ts, so no
 * DATABASE_URL is needed.
 *
 * @returns drizzle-kit's JSON plan.
 * @throws If drizzle-kit can't run or doesn't print a JSON plan.
 */
const planMigration = (): MigrationPlan => {
  const result = spawnSync(
    "drizzle-kit",
    [
      "generate",
      "--dialect=postgresql",
      "--schema=src/db/schema.ts",
      "--out=migrations",
      "--explain",
      "--output=json",
    ],
    { cwd: PROJECT_ROOT, encoding: "utf8" },
  );

  if (result.error) {
    throw new Error("Couldn't run drizzle-kit.", { cause: result.error });
  }

  try {
    return JSON.parse(result.stdout) as MigrationPlan;
  } catch {
    throw new Error(
      `drizzle-kit didn't return a plan:\n\n${result.stdout}${result.stderr}`,
    );
  }
};

const plan = planMigration();

if (plan.status === "no_changes") {
  console.log("✔ migrations match src/db/schema.ts");
} else {
  console.error(
    [
      "✖ src/db/schema.ts has changes without a migration.",
      "  Run `pnpm db:generate`, review the SQL in migrations/, and commit it with the schema change.",
      "",
      JSON.stringify(plan, null, 2),
    ].join("\n"),
  );
  process.exit(1);
}
