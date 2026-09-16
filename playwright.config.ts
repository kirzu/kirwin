import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Kirwin Bodyworks Dynamic Site.
 *
 * Scope:
 *   - Single Chromium project keeps the runner lightweight and matches
 *     the verification budget (CI runs in a minimal sandbox without
 *     graphical browsers).
 *   - Tests live under `./e2e/`. They cover the user-facing booking and
 *     admin flows plus lightweight smoke tests for the home page and
 *     language switcher.
 *
 * Server lifecycle:
 *   - `webServer.command` builds the production bundle and starts the
 *     Next.js server on port 3000. We use the production build (rather
 *     than `next dev`) so the tests exercise the same code path that
 *     real visitors do, and so `next build` failures are surfaced as
 *     a single failure rather than a confusing dev-only mismatch.
 *   - `reuseExistingServer` lets `npm run e2e` happily attach to a
 *     server the developer started manually (`npm start`) without
 *     trying to spin up a second instance on the same port.
 *   - `db:seed` runs first via `npm run e2e` so the dev database has a
 *     known course and admin user.
 *
 * Reporter:
 *   - `list` on the terminal gives an at-a-glance pass/fail summary
 *     without dumping large JSON trees.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /^(?!.*mobile).*\.spec\.ts$/,
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
      testMatch: /mobile\.spec\.ts$/,
    },
  ],
  webServer: {
    command: "npm run build && npm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 180_000,
  },
});
