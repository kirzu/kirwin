import { execFileSync } from "node:child_process";

/**
 * Test helpers for working with the development SQLite database.
 *
 * The E2E suite assumes `npm run db:seed` has been run (the npm script
 * for E2E does this in `pretest`). These helpers exist so individual
 * specs don't have to shell out to `prisma` themselves.
 */

/**
 * Invoke `prisma db seed` from the project root, streaming the output
 * so failures are easy to diagnose. Returns the stdout/stderr blob.
 */
export function runSeed(): string {
  try {
    const out = execFileSync("npx", ["prisma", "db", "seed"], {
      cwd: process.cwd(),
      stdio: "pipe",
      env: process.env,
    });
    return out.toString();
  } catch (err) {
    const message =
      err && typeof err === "object" && "stdout" in err
        ? `${(err as { stdout?: Buffer }).stdout?.toString() ?? ""}\n${(err as { stderr?: Buffer }).stderr?.toString() ?? ""}`
        : String(err);
    throw new Error(`prisma db seed failed: ${message}`);
  }
}
