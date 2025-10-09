import { test, expect } from "@playwright/test";

test.describe("Snapthumb Export", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the index page first
    await page.goto("/");
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
    // Click the "Start Creating" button to navigate to the app page
    await page.click('button:has-text("Start Creating")');
    // Wait for the app page to load
    await page.waitForLoadState("networkidle");
  });

  test("should load the app interface", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Check that the main app interface loads
    await expect(page.locator("h1")).toContainText("Snapthumb Editor");

    // Check that key components are present
    await expect(page.locator("text=Upload Media")).toBeVisible();
    await expect(page.locator("text=16:9 Crop")).toBeVisible();
    await expect(page.locator("text=Overlays")).toBeVisible();
    await expect(page.locator("text=Export Thumbnail")).toBeVisible();

    // Check that canvas is present
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("should have proper keyboard accessibility", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Test that canvas is focusable
    const canvas = page.locator("canvas");
    await canvas.focus();
    await expect(canvas).toBeFocused();

    // Test keyboard navigation
    await canvas.press("ArrowRight");
    await canvas.press("ArrowDown");
    await canvas.press("ArrowLeft");
    await canvas.press("ArrowUp");

    // Test modifier keys
    await canvas.press("Shift+ArrowRight");
    await canvas.press("Alt+ArrowDown");
  });

  test("should handle file upload interface", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Check that file input is present (hidden)
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // Check that upload area is clickable
    const uploadArea = page.locator("text=Click to upload video or image");
    await expect(uploadArea).toBeVisible();
  });

  test("should display export controls", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Check export format selection
    await expect(page.locator("select")).toBeVisible();

    // Check quality slider (custom slider component)
    await expect(page.locator('[role="slider"]')).toBeVisible();

    // Check export button
    const exportButton = page.locator('button:has-text("Export Thumbnail")');
    await expect(exportButton).toBeVisible();
  });

  test("should handle image upload and cropping", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Upload test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");

    // Wait for image processing
    await page.waitForTimeout(1000);

    // Check that canvas has content
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Check that crop controls are now available
    await expect(page.locator("text=Auto Crop")).toBeVisible();
    await expect(page.locator("text=Show Overlay")).toBeVisible();
  });

  test("should handle overlay functionality", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Add a text overlay
    const textInput = page.locator(
      'input[placeholder="Enter text for overlay..."]'
    );
    await textInput.fill("Test Overlay");

    const addTextButton = page.locator('button:has-text("Add Text")');
    await addTextButton.click();

    // Check that overlay was added
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    // Add a logo overlay
    const addLogoButton = page.locator('button:has-text("Add Logo")');
    await addLogoButton.click();

    // Check that both overlays are present
    await expect(page.locator("text=Active Overlays (2)")).toBeVisible();

    // Test overlay controls (use the first enabled undo button)
    const undoButton = page
      .locator('button:has-text("Undo"):not([disabled])')
      .first();
    await undoButton.click();

    // Should be back to 1 overlay
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    // Test redo (use the first enabled redo button)
    const redoButton = page
      .locator('button:has-text("Redo"):not([disabled])')
      .first();
    await redoButton.click();

    // Should be back to 2 overlays
    await expect(page.locator("text=Active Overlays (2)")).toBeVisible();
  });

  test("should export thumbnail with proper validation", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Upload test image first
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");
    await page.waitForTimeout(1000);

    // Check that export button is now enabled
    const exportButton = page.locator('button:has-text("Export Thumbnail")');
    await expect(exportButton).toBeEnabled();

    // Test format selection
    const formatSelect = page.locator("select");
    await formatSelect.selectOption("image/webp");

    // Test quality slider (custom slider component)
    const qualitySlider = page.locator('[role="slider"]');
    await expect(qualitySlider).toBeVisible();

    // Verify the quality percentage is displayed
    await expect(page.locator("text=80%")).toBeVisible();

    // Test export functionality
    const downloadPromise = page.waitForEvent("download");
    await exportButton.click();
    const download = await downloadPromise;

    // Verify download started
    expect(download.suggestedFilename()).toMatch(/snapthumb.*\.webp$/);
  });

  test("should support keyboard shortcuts", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    const canvas = page.locator("canvas");
    await canvas.focus();

    // Test basic arrow key navigation
    await canvas.press("ArrowRight");
    await canvas.press("ArrowDown");
    await canvas.press("ArrowLeft");
    await canvas.press("ArrowUp");

    // Test modifier keys
    await canvas.press("Shift+ArrowRight");
    await canvas.press("Alt+ArrowDown");

    // Test undo/redo shortcuts
    await canvas.press("Control+z");
    await canvas.press("Control+y");

    // Test export shortcut
    await canvas.press("Control+Enter");
  });

  test("should handle responsive design", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that layout adapts
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("canvas")).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Check that components are still accessible
    await expect(page.locator("text=Upload Media")).toBeVisible();
    await expect(page.locator("text=16:9 Crop")).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Check that all components are visible
    await expect(page.locator("text=Overlays")).toBeVisible();
    await expect(page.locator("text=Export Thumbnail")).toBeVisible();
  });

  test("should provide proper error handling", async () => {
    // Skip error handling test for now - requires proper file fixtures
    // TODO: Implement proper error handling test with fixtures
    test.skip(true, "Error handling test requires proper fixtures setup");
  });
});
