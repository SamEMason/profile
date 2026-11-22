import { spawnSync } from "node:child_process";

/** What a Docker Compose command did. Callers decide how to report failures. */
export type ComposeResult = {
  /** `true` if the command ran and exited with code 0. */
  ok: boolean;
  /** The exit code, or `null` if the command never ran. */
  status: number | null;
  stdout: string;
  stderr: string;
  /** Set when `docker` couldn't be run at all (for example, not installed). */
  error?: Error;
};

/**
 * Runs `docker compose` with output captured, without printing or throwing.
 *
 * @param args - Compose arguments, e.g. `["up", "-d", "--wait"]`, or
 *   `["-f", "compose.test.yml", "down", "-v"]` for another compose file.
 * @returns What happened: whether it worked, its exit code and its output.
 */
export const runCompose = (args: string[]): ComposeResult => {
  const result = spawnSync("docker", ["compose", ...args], {
    encoding: "utf8",
  });

  return {
    ok: !result.error && result.status === 0,
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    ...(result.error && { error: result.error }),
  };
};
