import { test, expect } from "@playwright/test";

/**
 * End-to-end test for the public booking flow.
 *
 * Flow under test:
 *   1. Seed creates a course + availability (run via `npm run e2e`).
 *   2. Visit `/en/courses/intro-to-myofascial-release`.
 *   3. Fill in the booking form and submit.
 *   4. Assert redirect to `/en/booking/confirmed?bookingId=...&email=...`.
 *   5. Assert the confirmation page renders the booking details.
 *   6. Assert the "Pay deposit" / payment CTA is present (because
 *      paymentStatus defaults to PENDING and Stripe is not configured
 *      per D002 — we deliberately do NOT click the button).
 *
 * This test runs against the production build (`npm run build && npm
 * start`) wired up in `playwright.config.ts`. The dev seed
 * (`prisma/seed.ts`) creates exactly the course referenced here.
 */

const COURSE_SLUG = "intro-to-myofascial-release";
const TEST_NAME = "E2E Tester";
const TEST_EMAIL = `e2e-${Date.now()}@example.com`;
const TEST_PHONE = "+852 5555 0000";

test.describe("Booking flow", () => {
  test("submits the form and reaches the confirmation page", async ({ page }) => {
    await page.goto(`/en/courses/${COURSE_SLUG}`);

    // The booking form should render on the course detail page. The
    // CardTitle is a div (not a heading role) so we match by text.
    await expect(page.locator("text=Book your seat").first()).toBeVisible();

    // The select element lists future availability slots. Pick the first
    // non-placeholder option so the test stays green as long as at
    // least one future slot exists.
    const slotSelect = page.locator('select[name="availabilityId"]');
    await expect(slotSelect).toBeVisible();
    const firstSlotValue = await slotSelect
      .locator("option")
      .nth(1) // skip the disabled placeholder option
      .getAttribute("value");
    expect(firstSlotValue).toBeTruthy();
    await slotSelect.selectOption(firstSlotValue as string);

    // Fill the rest of the form using field-name selectors so the test
    // stays independent of i18n labels and aria-generated ids.
    await page.locator('input[name="name"]').fill(TEST_NAME);
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await page.locator('input[name="phone"]').fill(TEST_PHONE);
    await page
      .locator('textarea[name="notes"]')
      .fill("Booked via Playwright E2E test.");

    // Submit. The form navigates via `next/navigation`'s `router.push`,
    // which is a client-side transition and does NOT fire the `load`
    // event Playwright's `waitForURL` waits for by default. We poll
    // the URL instead.
    await page.getByRole("button", { name: /Continue to payment/i }).click();
    await page.waitForURL(
      /\/en\/booking\/confirmed\?bookingId=[^&]+&email=[^&]+/,
      { timeout: 30_000, waitUntil: "commit" },
    );

    // The page should now show the "Thank you" heading and the booking
    // reference block. The thank-you text comes from
    // `booking.confirmed.title`.
    await expect(page.locator("text=Thank you for your booking!").first()).toBeVisible();
    await expect(page.locator("text=Booking details").first()).toBeVisible();
    await expect(page.getByText(TEST_NAME)).toBeVisible();
    await expect(page.getByText(TEST_EMAIL)).toBeVisible();

    // The payment CTA should be present because the new booking is
    // PENDING and Stripe is not configured. We assert presence only;
    // clicking it would attempt a live Stripe round-trip.
    const paymentCta = page.getByTestId("payment-cta");
    await expect(paymentCta).toBeVisible();
    await expect(paymentCta.getByRole("button")).toBeVisible();
  });
});
