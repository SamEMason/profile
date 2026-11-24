import { serveMcp } from "#src/mcp/serve.js";

try {
  process.loadEnvFile();
} catch {
  // No .env file: use the environment as it is.
}

// stdout is the MCP protocol channel, so problems go to stderr.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Add it to .env (see .env.example).");
  process.exit(1);
}

serveMcp(databaseUrl);
