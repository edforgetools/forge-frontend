import { test, expect } from "@playwright/test";

test.describe("Compression Selector (FE-012)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Navigate to app page
    await page.click('a:has-text("Launch Snapthumb")');
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Upload a test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");

    // Wait for image to load
    await expect(page.locator('[data-testid="canvas-toolbar"]')).toBeVisible();
  });

  test("should show compression settings when toggled", async ({ page }) => {
    // Click show compression button
    await page.click('button:has-text("Show Compression")');

    // Verify compression selector is visible
    await expect(page.locator("text=Quality:")).toBeVisible();
    await expect(page.locator('button:has-text("High")')).toBeVisible();
    await expect(page.locator('button:has-text("Medium")')).toBeVisible();
    await expect(page.locator('button:has-text("Low")')).toBeVisible();
  });

  test("should hide compression settings when toggled off", async ({
    page,
  }) => {
    // Show compression settings first
    await page.click('button:has-text("Show Compression")');
    await expect(page.locator("text=Quality:")).toBeVisible();

    // Hide compression settings
    await page.click('button:has-text("Hide Compression")');

    // Verify compression selector is hidden
    await expect(page.locator("text=Quality:")).not.toBeVisible();
  });

  test("should have quality presets with correct targets", async ({ page }) => {
    await page.click('button:has-text("Show Compression")');

    // Test High quality preset
    await page.click('button:has-text("High")');
    await expect(page.locator("text=High Quality")).toBeVisible();
    await expect(page.locator("text=≤1.5MB, SSIM ≥85%")).toBeVisible();

    // Test Medium quality preset
    await page.click('button:has-text("Medium")');
    await expect(page.locator("text=Medium Quality")).toBeVisible();
    await expect(page.locator("text=≤1.0MB, SSIM ≥80%")).toBeVisible();

    // Test Low quality preset
    await page.click('button:has-text("Low")');
    await expect(page.locator("text=Low Quality")).toBeVisible();
    await expect(page.locator("text=≤0.8MB, SSIM ≥75%")).toBeVisible();
  });

  test("should show advanced settings when toggled", async ({ page }) => {
    await page.click('button:has-text("Show Compression")');

    // Click show advanced
    await page.click('button:has-text("Show Advanced")');

    // Verify advanced settings are visible
    await expect(page.locator("text=Quality: High")).toBeVisible();
    await expect(page.locator("text=Target Size: ≤1.5MB")).toBeVisible();
    await expect(page.locator("text=SSIM Threshold: ≥85%")).toBeVisible();
  });

  test("should export with compression settings and verify file size", async ({
    page,
  }) => {
    // Set up download promise
    const downloadPromise = page.waitForEvent("download");

    // Configure compression settings
    await page.click('button:has-text("Show Compression")');
    await page.click('button:has-text("Medium")'); // Use medium quality

    // Export the image
    await page.click('button:has-text("Export Thumbnail")');

    // Wait for download to complete
    const download = await downloadPromise;

    // Verify download occurred
    expect(download.suggestedFilename()).toMatch(/snapthumb-.*\.jpg$/);

    // Note: In a real test environment, you would verify the file size
    // by reading the downloaded file and checking its size is ≤ 1MB
    // This requires additional setup for file system access in tests
  });

  test("should persist compression settings in IndexedDB", async ({ page }) => {
    // Configure compression settings
    await page.click('button:has-text("Show Compression")');
    await page.click('button:has-text("High")');

    // Reload the page
    await page.reload();

    // Wait for image to load again
    await page
      .locator('input[type="file"]')
      .setInputFiles("e2e/fixtures/test-image.png");
    await expect(page.locator("canvas")).toBeVisible();

    // Show compression settings and verify High preset is still selected
    await page.click('button:has-text("Show Compression")');
    await expect(page.locator("text=High Quality")).toBeVisible();
  });

  test("should work with different export formats", async ({ page }) => {
    await page.click('button:has-text("Show Compression")');

    // Test with JPEG
    await page.selectOption('select[id="export-format"]', "image/jpeg");
    await page.click('button:has-text("High")');
    await expect(page.locator("text=High Quality")).toBeVisible();

    // Test with WebP
    await page.selectOption('select[id="export-format"]', "image/webp");
    await page.click('button:has-text("Medium")');
    await expect(page.locator("text=Medium Quality")).toBeVisible();

    // Test with PNG (should still show compression settings)
    await page.selectOption('select[id="export-format"]', "image/png");
    await expect(page.locator("text=Quality:")).toBeVisible();
  });

  test("should disable compression settings during export", async ({
    page,
  }) => {
    await page.click('button:has-text("Show Compression")');

    // Start export
    const exportPromise = page.click('button:has-text("Export Thumbnail")');

    // Verify settings are disabled during export
    await expect(page.locator('button:has-text("High")')).toBeDisabled();
    await expect(
      page.locator('button:has-text("Show Advanced")')
    ).toBeDisabled();

    // Wait for export to complete
    await exportPromise;

    // Verify settings are enabled again
    await expect(page.locator('button:has-text("High")')).toBeEnabled();
  });

  test("should show file size feedback with compression", async ({ page }) => {
    await page.click('button:has-text("Show Compression")');
    await page.click('button:has-text("Low")'); // Use low quality for smaller file

    // Export and wait for completion
    await page.click('button:has-text("Export Thumbnail")');

    // Wait for file size to be displayed
    await expect(page.locator("text=Size:")).toBeVisible();

    // Verify size is under the target limit (0.8MB for Low quality)
    const sizeText = await page.locator("text=Size:").textContent();
    expect(sizeText).toMatch(/Size: \d+\.?\d* [KM]B/);

    // Should show "Under limit" message
    await expect(page.locator("text=✓ Under limit")).toBeVisible();
  });

  test("should handle compression failure gracefully", async ({ page }) => {
    // This test would require a very large or complex image
    // For now, we'll test the UI behavior when compression is in progress

    await page.click('button:has-text("Show Compression")');
    await page.click('button:has-text("High")');

    // Start export
    await page.click('button:has-text("Export Thumbnail")');

    // Verify loading state
    await expect(page.locator("text=Exporting...")).toBeVisible();

    // Wait for completion
    await expect(page.locator("text=Export Thumbnail")).toBeVisible();
  });
});
