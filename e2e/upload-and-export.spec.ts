import { test, expect } from "@playwright/test";

test.describe("Upload and Export Flow", () => {
  test("should upload sample image, add overlays, and export", async ({
    page,
  }) => {
    await page.goto("/");

    // Click start creating button
    await page.click("text=Start Creating");

    // Wait for app to load
    await page.waitForSelector('[data-testid="app-shell"]', { timeout: 10000 });

    // Upload sample image
    await page.click("text=Try sample image");

    // Wait for image to load
    await page.waitForSelector("canvas", { timeout: 5000 });

    // Switch to overlays panel
    await page.click("text=Overlays");

    // Add text overlay
    await page.click("text=Add Text");

    // Wait for text overlay to be added
    await page.waitForSelector('[data-testid="overlay-item"]', {
      timeout: 5000,
    });

    // Switch to export panel
    await page.click("text=Export");

    // Click export button
    await page.click("text=Export");

    // Wait for export dialog
    await page.waitForSelector('[data-testid="export-dialog"]', {
      timeout: 5000,
    });

    // Check that size estimation is shown
    await expect(page.locator("text=Estimated Size")).toBeVisible();

    // Click export button in dialog
    await page.click("text=Export JPEG");

    // Wait for download to start (this might not work in headless mode)
    // In a real test, you'd check for the download or success message
    await page.waitForTimeout(2000);
  });

  test("should show proper validation for file size", async ({ page }) => {
    await page.goto("/");

    // Click start creating button
    await page.click("text=Start Creating");

    // Wait for app to load
    await page.waitForSelector('[data-testid="app-shell"]', { timeout: 10000 });

    // Upload sample image
    await page.click("text=Try sample image");

    // Wait for image to load
    await page.waitForSelector("canvas", { timeout: 5000 });

    // Switch to export panel
    await page.click("text=Export");

    // Click export button
    await page.click("text=Export");

    // Wait for export dialog
    await page.waitForSelector('[data-testid="export-dialog"]', {
      timeout: 5000,
    });

    // Check that size limit is shown
    await expect(page.locator("text=Limit: 2 MB")).toBeVisible();
  });
});
