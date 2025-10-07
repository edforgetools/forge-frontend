import { test, expect } from "@playwright/test";

test.describe("CI Basic Smoke Tests", () => {
  test("should load the landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check main elements are present
    await expect(page.locator("h1")).toContainText("Snapthumb");
    await expect(
      page.locator('button:has-text("Start Creating")')
    ).toBeVisible();
  });

  test("should navigate to app page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Click start button
    await page.click('button:has-text("Start Creating")');
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check app page loaded
    await expect(page.locator("h1")).toContainText("Snapthumb Editor");
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
  });
});
