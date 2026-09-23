import { test, expect } from "@playwright/test";

/**
 * Smoke tests for the homepage.
 *
 * These checks assert the two supported locales render and that the
 * language switcher (rendered as a pair of links) navigates between
 * them. They are deliberately light: a single heading + a switcher
 * hop is enough to prove the i18n pipeline and the locale middleware
 * are both alive end-to-end.
 */

test.describe("Home page", () => {
  test("renders the en homepage", async ({ page }) => {
    await page.goto("/en");
    // A single booking card leads with a bookings CTA — make sure it
    // resolves to the localised path.
    await expect(
      page.locator('[data-testid="home-choice-massage-cta"]').first(),
    ).toHaveAttribute("href", "/en/bookings");
    // Courses stay reachable via the nav, while the demoted training path
    // surfaces as small print linking to the contact page.
    await expect(page.locator('a[href="/en/courses"]').first()).toBeVisible();
    await expect(
      page.locator('[data-testid="home-course-interest-cta"]'),
    ).toHaveAttribute("href", "/en/contact");
    // The quiet courses companion card also points at the contact page.
    await expect(page.getByTestId("home-courses-card")).toBeVisible();
    await expect(
      page.locator('[data-testid="home-courses-card-cta"]'),
    ).toHaveAttribute("href", "/en/contact");
    // Body should mention the English hero subtitle somewhere on the page.
    await expect(page.locator("body")).toContainText(
      "Therapeutic bodywork in Wan Chai",
    );
  });

  test("renders the zh-Hant homepage", async ({ page }) => {
    await page.goto("/zh-Hant");
    await expect(
      page.locator('[data-testid="home-choice-massage-cta"]').first(),
    ).toHaveAttribute("href", "/zh-Hant/bookings");
    await expect(
      page.locator('[data-testid="home-courses-card-cta"]'),
    ).toHaveAttribute("href", "/zh-Hant/contact");
    await expect(page.locator('a[href="/zh-Hant/courses"]').first()).toBeVisible();
    // Any non-empty Chinese content proves the zh-Hant catalogue rendered.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toMatch(/[一-鿿]/);
  });

  test("language switcher navigates between locales", async ({ page }) => {
    await page.goto("/en");
    const zhLink = page.getByRole("link", { name: "繁體中文" });
    await expect(zhLink).toBeVisible();
    await zhLink.click();
    await expect(page).toHaveURL(/\/zh-Hant(\/|$)/);
    // Once on the zh-Hant home we should still see the booking CTA.
    await expect(
      page.locator('[data-testid="home-choice-massage-cta"]').first(),
    ).toHaveAttribute("href", "/zh-Hant/bookings");
  });

  test("booking card navigates to bookings", async ({ page }) => {
    await page.goto("/en");

    await page
      .locator('[data-testid="home-choice-massage-cta"]')
      .first()
      .click();
    await page.waitForURL(/\/en\/bookings$/, { timeout: 10_000 });
    await expect(
      page.getByTestId("bookings-cliniko-iframe"),
    ).toBeVisible();
  });
});
