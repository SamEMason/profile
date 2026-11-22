/** Settings for the database connection. */
export const databaseConfig = {
  /** How long to wait for a connection before failing, instead of hanging forever. */
  connectionTimeoutMs: 5000,
} as const;
