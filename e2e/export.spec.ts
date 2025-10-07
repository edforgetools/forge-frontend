import { test, expect } from "@playwright/test";

test.describe("Export Flow", () => {
  test("should upload sample image, add text overlay, and export successfully", async ({
    page,
  }) => {
    // 1. Open localhost preview
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Click start creating button
    await page.click("text=Start Creating");

    // Wait for app to load with timeout
    await page.waitForSelector('[data-testid="app-shell"]', { timeout: 15000 });

    // 2. Upload sample image
    await page.click("text=Try sample image");

    // Wait for image to load
    await page.waitForSelector("canvas", { timeout: 10000 });

    // 3. Add text overlay "SNAPTHUMB"
    await page.click("text=Overlays");

    // Add text overlay
    await page.click("text=Add Text");

    // Wait for text overlay to be added
    await page.waitForSelector('[data-testid="overlay-item"]', {
      timeout: 10000,
    });

    // Find the text input and type "SNAPTHUMB"
    const textInput = page
      .locator('input[placeholder*="text"], input[type="text"]')
      .first();
    await textInput.fill("SNAPTHUMB");

    // 4. Export and expect "export complete" toast
    // First click should open the export panel
    await page.click("text=Export");

    // Debug: Take a screenshot before clicking export button
    await page.screenshot({ path: "debug-before-export.png" });

    // Click the actual export button (the one in the sticky footer)
    const exportButton = page.locator('button[aria-label*="Export thumbnail"]');
    await expect(exportButton).toBeEnabled();
    await exportButton.click();

    // Debug: Take a screenshot after clicking export button
    await page.screenshot({ path: "debug-after-export.png" });

    // Wait for export dialog
    await page.waitForSelector('[data-testid="export-dialog"]', {
      timeout: 10000,
    });

    // Click export button in dialog (could be "Smart Export" or "Export JPEG")
    const dialogExportButton = page.locator(
      '[data-testid="export-dialog"] button:has-text("Export")'
    );
    await dialogExportButton.click();

    // Wait for and verify the success toast appears
    await expect(page.locator('text="Export successful! 🎉"')).toBeVisible({
      timeout: 15000,
    });

    // Verify the toast contains file size information
    await expect(
      page.locator("text=/Downloaded .* in .*/").first()
    ).toBeVisible();
  });
});
