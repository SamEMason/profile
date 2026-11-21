import { randomUUID } from "node:crypto";

/**
 * Generates a new random ID.
 *
 * @returns A random UUID (v4) string, e.g. `"3b241101-e2bb-4255-8caf-4136c566a962"`.
 */
export const newId = (): string => randomUUID();
