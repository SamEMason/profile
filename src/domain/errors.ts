import * as z from "zod";

/**
 * Thrown when input fails validation, for example an empty description.
 * Its message lists each problem on its own line, readable by people and agents;
 * `issues` keeps zod's details for code that needs them.
 */
export class ValidationError extends Error {
  /** Each problem zod found, with the field path and a message. */
  readonly issues: z.ZodError["issues"];

  /**
   * @param error - The ZodError from a failed `safeParse`.
   */
  constructor(error: z.ZodError) {
    super(z.prettifyError(error));
    this.name = "ValidationError";
    this.issues = error.issues;
  }
}
