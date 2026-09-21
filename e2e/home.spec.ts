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
    // The hero CTA points at /courses — make sure the link actually
    // resolves to the localised path.
    await expect(page.locator('a[href="/en/courses"]').first()).toBeVisible();
    // Body should mention the English hero tagline somewhere on the page.
    await expect(page.locator("body")).toContainText(
      "Hands-on neuromuscular therapy and deep tissue bodywork seminars.",
    );
  });

  test("renders the zh-Hant homepage", async ({ page }) => {
    await page.goto("/zh-Hant");
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
    // Once on the zh-Hant home we should still see the courses link.
    await expect(page.locator('a[href="/zh-Hant/courses"]').first()).toBeVisible();
  });
});
