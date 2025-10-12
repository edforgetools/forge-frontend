import { test, expect } from "@playwright/test";

test.describe("CI Basic Smoke Tests", () => {
  test("should load the landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Simple check that page loads and has some content
    await expect(page.locator("body")).toBeVisible();

    // Wait for React to load by checking that the loading spinner disappears
    await expect(page.locator(".loading")).not.toBeVisible({ timeout: 15000 });

    // Check that there's at least one heading
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
  });

  test("should have start button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Wait for React to load by checking that the loading spinner disappears
    await expect(page.locator(".loading")).not.toBeVisible({ timeout: 15000 });

    // Check for any button with "Start" text (more flexible matching)
    await expect(
      page.locator('a:has-text("Launch Snapthumb")').first()
    ).toBeVisible({
      timeout: 10000,
    });
  });
});
