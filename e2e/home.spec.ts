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
    // The choice cards now lead with a bookings CTA — make sure the
    // massage choice link resolves to the localised path.
    await expect(
      page.locator('[data-testid="home-choice-massage-cta"]').first(),
    ).toHaveAttribute("href", "/en/bookings");
    await expect(page.locator('a[href="/en/courses"]').first()).toBeVisible();
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
    // Once on the zh-Hant home we should still see the choice CTA.
    await expect(
      page.locator('[data-testid="home-choice-massage-cta"]').first(),
    ).toHaveAttribute("href", "/zh-Hant/bookings");
  });

  test("choice cards navigate to bookings and courses", async ({ page }) => {
    await page.goto("/en");

    await page
      .locator('[data-testid="home-choice-massage-cta"]')
      .first()
      .click();
    await page.waitForURL(/\/en\/bookings$/, { timeout: 10_000 });
    await expect(
      page.getByTestId("bookings-cliniko-iframe"),
    ).toBeVisible();

    await page.goto("/en");
    await page
      .locator('[data-testid="home-choice-courses-cta"]')
      .first()
      .click();
    await page.waitForURL(/\/en\/courses$/, { timeout: 10_000 });
  });
});
