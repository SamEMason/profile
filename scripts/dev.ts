import { spawn } from "node:child_process";
import { styleText } from "node:util";
import { runCompose } from "./lib/compose.js";

/** The word "profile" in block letters, shown at the top of `pnpm dev`. */
const WORDMARK: readonly string[] = [
  "█▀█ █▀█ █▀█ █▀▀ █ █   █▀▀",
  "█▀▀ █▀▄ █▄█ █▀  █ █▄▄ ██▄",
];

/** Whether output goes to a real terminal (not a pipe or a log file). */
const isTerminal = process.stdout.isTTY;

/**
 * Builds the dim vertical rail that connects the timeline's steps.
 *
 * @returns The styled `│` character.
 */
const rail = (): string => styleText("gray", "│");

/**
 * Builds one step line of the timeline.
 *
 * @param symbol - The step's marker, already styled, e.g. a green `◇`.
 * @param name - The step name, shown bold, e.g. `"postgres"`.
 * @param detail - Extra information, shown dim, e.g. `"ready on 127.0.0.1:5432 (1.4s)"`.
 * @returns The line, e.g. `"◇  postgres  ready on 127.0.0.1:5432 (1.4s)"`.
 */
const step = (symbol: string, name: string, detail: string): string =>
  `${symbol}  ${styleText("bold", name)}  ${styleText("dim", detail)}`;

/**
 * Prints the header: the block-letter wordmark, or a one-line title when the
 * output isn't a terminal or the terminal is too narrow for the wordmark.
 */
const printHeader = (): void => {
  const width = WORDMARK[0]?.length ?? 0;

  if (isTerminal && process.stdout.columns >= width) {
    console.log();
    for (const line of WORDMARK) console.log(styleText(["cyan", "bold"], line));
    console.log(styleText("dim", "dev".padStart(width)));
    console.log(styleText("gray", "┌"));
  } else {
    console.log(
      `${styleText("gray", "┌")}  ${styleText("bold", "profile")} ${styleText("dim", "dev")}`,
    );
  }
  console.log(rail());
};

/**
 * Asks Docker Compose which host address the database's port is published on.
 *
 * @returns The address, e.g. `"127.0.0.1:5432"`, or `undefined` if it can't be read.
 */
const databaseAddress = (): string | undefined => {
  const result = runCompose(["port", "db", "5432"]);
  const address = result.ok ? result.stdout.trim() : "";
  return address || undefined;
};

/**
 * Prints a failed Postgres step, with Docker's own output (if any) and a hint,
 * then exits.
 *
 * @param problem - What went wrong, e.g. `"failed to start"`.
 * @param hint - What to check, e.g. `"Is Colima running?"`.
 * @param output - Docker's captured output, printed dim along the rail.
 * @param code - The exit code. Defaults to `1`.
 */
const failDatabase = (
  problem: string,
  hint: string,
  output = "",
  code = 1,
): never => {
  console.log(step(styleText("red", "▲"), "postgres", problem));
  for (const line of output.trim().split("\n").filter(Boolean)) {
    console.log(`${rail()}  ${styleText("dim", line)}`);
  }
  console.log(`${rail()}  ${hint}`);
  console.log(styleText("gray", "└"));
  process.exit(code);
};

/**
 * Starts the Postgres container and waits until its health check passes.
 * Docker's output is hidden unless something goes wrong.
 */
const startDatabase = (): void => {
  if (isTerminal) {
    process.stdout.write(step(styleText("gray", "◇"), "postgres", "starting…"));
  }

  const startedAt = performance.now();
  const result = runCompose(["up", "-d", "--wait"]);
  const seconds = ((performance.now() - startedAt) / 1000).toFixed(1);

  // Clear the "starting…" line so the result replaces it.
  if (isTerminal) process.stdout.write("\r\x1b[2K");

  if (result.error) {
    failDatabase(
      "couldn't run docker",
      "Is Docker (Colima) installed and on your PATH?",
    );
  }
  if (!result.ok) {
    failDatabase(
      "failed to start",
      "Is Colima running? Is port 5432 free?",
      `${result.stdout}${result.stderr}`,
      result.status ?? 1,
    );
  }

  const address = databaseAddress();
  const detail = address
    ? `ready on ${address} (${seconds}s)`
    : `ready (${seconds}s)`;
  console.log(step(styleText("green", "◇"), "postgres", detail));
  console.log(rail());
};

/**
 * Runs the app with tsx, restarting on save, and prints a closing line when
 * it stops (for example after Ctrl+C). Exits with the app's exit code.
 */
const runApp = (): void => {
  console.log(step(styleText("cyan", "◆"), "app", "watching src/index.ts"));
  console.log(styleText("gray", "└"));
  console.log();

  // Ctrl+C reaches tsx too. Ignoring it here keeps this script alive long
  // enough to print the closing line after tsx exits.
  process.on("SIGINT", () => {});

  const app = spawn("tsx", ["watch", "--clear-screen=false", "src/index.ts"], {
    stdio: "inherit",
  });

  app.on("exit", (code) => {
    console.log();
    console.log(
      step(
        styleText("gray", "■"),
        "app",
        "stopped · postgres still running (docker compose down to stop it)",
      ),
    );
    process.exit(code ?? 0);
  });
};

printHeader();
startDatabase();
runApp();
