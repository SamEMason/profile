import { runCompose } from "#scripts/lib/compose.js";

/**
 * Starts the Postgres container and waits until its health check passes.
 * Prints nothing on success: stdout is about to become the MCP protocol channel.
 * On failure, prints Docker's output and a hint to stderr, then exits.
 */
const startDatabase = (): void => {
  const result = runCompose(["up", "-d", "--wait"]);
  if (result.ok) return;

  console.error(
    result.error
      ? "Couldn't run docker. Is Docker (Colima) installed and on your PATH?"
      : `Postgres failed to start. Is Colima running? Is port 5432 free?\n${result.stdout}${result.stderr}`,
  );
  process.exit(result.status ?? 1);
};

startDatabase();

// Imported only now, so the server starts after Postgres is ready.
await import("#src/index.js");
