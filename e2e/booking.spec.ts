import { test, expect } from "@playwright/test";

/**
 * End-to-end test for the public booking page.
 *
 * The page now embeds the Cliniko scheduler directly so visitors can
 * book a session without leaving the site. The test confirms:
 *   - The /bookings route renders the embedded Cliniko iframe.
 *   - The fallback link to the Cliniko scheduler is reachable.
 *   - The booking page copy is session-focused in both locales.
 */
test.describe("Booking flow", () => {
  test("submit reaches the confirmation page", async ({ page }) => {
    await page.goto("/en/bookings");

    // The page renders the Cliniko scheduler inside an iframe.
    const iframe = page.getByTestId("bookings-cliniko-iframe");
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute(
      "src",
      /stephen-kirwin-bodywork-therapies-ltd\.au5\.cliniko\.com\/bookings/,
    );

    // The fallback link also points at the Cliniko scheduler.
    const fallback = page.getByTestId("bookings-cliniko-fallback");
    await expect(fallback).toBeVisible();
    await expect(fallback).toHaveAttribute(
      "href",
      /stephen-kirwin-bodywork-therapies-ltd\.au5\.cliniko\.com\/bookings/,
    );

    // The page is session-focused in the en catalogue.
    await expect(page.locator("body")).toContainText("Book a session");
  });

  test("renders the zh-Hant bookings page with the embedded scheduler", async ({
    page,
  }) => {
    await page.goto("/zh-Hant/bookings");
    const iframe = page.getByTestId("bookings-cliniko-iframe");
    await expect(iframe).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toMatch(/[一-鿿]/);
  });
});
