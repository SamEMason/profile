import { initialTables } from "./001-initial-tables.js";

/**
 * Every migration, in the order they run. Add new ones at the end.
 * Never edit or reorder one that has already run: existing databases won't re-run it.
 */
export const MIGRATIONS: readonly string[] = [initialTables];
