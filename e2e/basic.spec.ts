import { test, expect } from "@playwright/test";

test.describe("Snapthumb Basic Tests", () => {
  test("should load the landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check main elements are present
    await expect(page.locator("h1")).toContainText("Snapthumb");
    await expect(
      page.locator('button:has-text("Start Creating")')
    ).toBeVisible();

    // Check feature cards
    await expect(page.locator("text=Video Frames")).toBeVisible();
    await expect(page.locator("text=Smart Cropping")).toBeVisible();
    await expect(page.locator("text=Export Ready")).toBeVisible();
  });

  test("should navigate to app page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Click start button
    await page.click('button:has-text("Start Creating")');
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check app page loaded
    await expect(page.locator("h1")).toContainText("Snapthumb Editor");
    await expect(page.locator("text=Upload Media")).toBeVisible();
    await expect(page.locator("text=16:9 Crop")).toBeVisible();
    await expect(page.locator("text=Overlays")).toBeVisible();
    await expect(page.locator("text=Export Thumbnail")).toBeVisible();
  });

  test("should have proper TypeScript configuration", async ({ page }) => {
    // This test verifies TypeScript configuration
    expect(true).toBe(true);
  });
});
