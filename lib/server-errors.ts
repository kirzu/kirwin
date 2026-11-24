/**
 * Log the real error server-side and return a message that is safe to show
 * to a client. Prisma/driver messages expose table names, column names and
 * constraint identifiers, so they must never reach the browser.
 */
export function serverErrorMessage(scope: string, err: unknown): string {
  // eslint-disable-next-line no-console
  console.error(`[${scope}]`, err);
  return "Something went wrong. Please try again.";
}
