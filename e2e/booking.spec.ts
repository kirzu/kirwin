import { test, expect } from "@playwright/test";

/**
 * End-to-end test for the public booking flow.
 *
 * The internal booking flow has been retired in favour of the external
 * Cliniko booking page. This file is kept as a placeholder so the
 * Playwright run is not blocked by a missing spec, but the actual
 * booking flow is now covered by the home / courses specs, which
 * assert the public CTAs link out to Cliniko.
 */

test.describe("Booking flow", () => {
  test.skip("internal booking flow is no longer supported", async () => {
    await expect(true).toBe(true);
  });
});
