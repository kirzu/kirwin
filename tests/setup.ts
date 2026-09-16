import { vi, afterEach, beforeAll } from "vitest";
import { execSync } from "node:child_process";

// Vitest setup file. Sets process.env.DATABASE_URL to the local Postgres
// test database before any module that reads it (e.g. `@/lib/prisma`) is
// imported. The test database is reset on every test run via
// `prisma db push --force-reset` so suites start from a clean schema.
//
// If a Postgres instance is not available (no `kirwin_test` database on
// localhost:5432), individual tests that exercise Prisma are expected to
// mock `@/lib/prisma` so they still pass.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://kirwin:kirwin@localhost:5432/kirwin_test";

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://kirwin:kirwin@localhost:5432/kirwin_test";

let didResetSchema = false;
try {
  // Best-effort reset. We intentionally don't fail the suite if Postgres is
  // unavailable — the per-test mocks will still satisfy most assertions.
  execSync(`npx prisma db push --force-reset --skip-generate`, {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "ignore",
  });
  didResetSchema = true;
} catch {
  didResetSchema = false;
}

beforeAll(() => {
  if (didResetSchema) {
    // eslint-disable-next-line no-console
    console.log(`[vitest setup] test database reset at ${TEST_DATABASE_URL}`);
  }
});

// Add Testing Library matchers for React component tests.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

// Explicit cleanup is required when Vitest reuses a single jsdom
// environment across multiple `.test.tsx` files (singleFork).
afterEach(cleanup);

// GSAP ScrollTrigger uses matchMedia at import time in jsdom environments.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
