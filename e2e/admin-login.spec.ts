import { test, expect } from "@playwright/test";

/**
 * End-to-end test for the admin login flow.
 *
 * Uses the credentials seeded by `prisma/seed.ts` (sourced from the
 * `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars). On success the user is
 * redirected to `/{locale}/admin` (the dashboard index).
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me-in-production";

test.describe("Admin login", () => {
  test("logs in with seeded credentials and reaches the dashboard", async ({ page }) => {
    await page.goto("/en/admin/login");

    // CardTitle is a div, so use a text locator.
    await expect(page.locator("text=Sign in").first()).toBeVisible();

    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);

    await page.getByRole("button", { name: /Sign in/i }).click();
    // The login form uses `window.location.href = ...` after success,
    // which is a full navigation (load event fires).
    await page.waitForURL(/\/en\/admin(\/|$)/, { timeout: 30_000 });

    // After login the user lands on the admin dashboard. The dashboard
    // greets the user with a localised "Welcome back, {name}" heading.
    await expect(page).toHaveURL(/\/en\/admin(\/|$)/);
    await expect(page.locator("h1", { hasText: /Welcome back/i }).first()).toBeVisible();
  });

  test("rejects wrong credentials with an inline error", async ({ page }) => {
    await page.goto("/en/admin/login");
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill("definitely-not-the-password");

    await page.getByRole("button", { name: /Sign in/i }).click();

    // The login page surfaces the translated `admin.login.error`
    // ("Invalid email or password.") inline in a destructive-styled <p>.
    await expect(
      page.locator("p.text-destructive").first(),
    ).toBeVisible({ timeout: 10_000 });
    // We must still be on the login page — no redirect on failure.
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
