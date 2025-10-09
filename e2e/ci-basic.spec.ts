import { test, expect } from "@playwright/test";

test.describe("CI Basic Smoke Tests", () => {
  test("should load the landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Simple check that page loads and has some content
    await expect(page.locator('body')).toBeVisible();
    
    // Check that there's at least one heading
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test("should have start button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Check for any button with "Start" text
    await expect(page.locator('button:has-text("Start")')).toBeVisible(
      { timeout: 10000 }
    );
  });
});
