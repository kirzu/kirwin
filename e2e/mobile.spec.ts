import { test, expect } from "@playwright/test";

/**
 * Mobile viewport smoke tests.
 *
 * Runs against the `mobile-chromium` project (see `playwright.config.ts`)
 * which uses the `iPhone 12` device emulation. Verifies that:
 *
 *   1. The desktop `MainNav` is hidden on small screens.
 *   2. The hamburger toggle is visible.
 *   3. Tapping it opens a drawer containing the nav links and the
 *      language switcher.
 *   4. Selecting a link navigates to the target page.
 *   5. The destination page renders without horizontal overflow and
 *      shows the expected heading.
 */
test.describe("Mobile layout", () => {
  test("hamburger menu navigates to courses", async ({ page }) => {
    await page.goto("/en");

    // The hamburger toggle is the only way to access navigation on
    // mobile; the desktop nav should be hidden via the `md:` breakpoint.
    const toggle = page.getByTestId("mobile-menu-toggle");
    await expect(toggle).toBeVisible();

    // The desktop MainNav renders a `<ul>` with links to /en/courses;
    // on a mobile viewport it is wrapped in `hidden md:flex` and should
    // not be visible.
    const desktopCourses = page.locator(
      'header nav div.hidden a[href="/en/courses"]',
    );
    await expect(desktopCourses).toBeHidden();

    // Open the drawer.
    await toggle.click();
    const drawer = page.getByTestId("mobile-menu-drawer");
    await expect(drawer).toBeVisible();

    // The drawer contains the public nav links. Tap "Courses".
    const coursesLink = drawer.getByRole("link", { name: "Courses" });
    await expect(coursesLink).toBeVisible();
    await coursesLink.click();

    // Wait for the client-side navigation to land on /en/courses.
    await page.waitForURL(/\/en\/courses$/, { timeout: 10_000 });

    // The hero heading on the courses page should be visible.
    await expect(
      page.getByRole("heading", { level: 1 }).first(),
    ).toBeVisible();

    // The page should not horizontally overflow. We compare the
    // document's scroll width against the viewport width, allowing a
    // small tolerance for the vertical scrollbar on some viewports.
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(10);
  });

  test("language switcher in drawer swaps locales", async ({ page }) => {
    await page.goto("/en");
    await page.getByTestId("mobile-menu-toggle").click();

    const drawer = page.getByTestId("mobile-menu-drawer");
    await expect(drawer).toBeVisible();

    const zhLink = drawer.getByRole("link", { name: "繁體中文" });
    await expect(zhLink).toBeVisible();
    await zhLink.click();

    await page.waitForURL(/\/zh-Hant(\/|$)/, { timeout: 10_000 });
    // The page should now render in Traditional Chinese.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toMatch(/[一-鿿]/);
  });
});
