import { spawn, spawnSync } from "node:child_process";

/**
 * Starts the Postgres container and waits until its health check passes.
 * Exits the process if Docker is missing or the container fails to start.
 */
const startDatabase = (): void => {
  const result = spawnSync("docker", ["compose", "up", "-d", "--wait"], {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(
      "Couldn't run docker. Is Docker (Colima) installed and running?",
    );
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
};

/**
 * Runs the app with tsx, restarting on save. Exits with the app's exit code
 * when it stops (for example after Ctrl+C).
 */
const runApp = (): void => {
  const app = spawn("tsx", ["watch", "src/index.ts"], { stdio: "inherit" });
  app.on("exit", (code) => process.exit(code ?? 0));
};

startDatabase();
runApp();
