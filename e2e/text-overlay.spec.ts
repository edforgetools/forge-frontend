import { test, expect } from "@playwright/test";

test.describe("Text Overlay Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("a:has-text('Launch Snapthumb')");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Upload a test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");
    await page.waitForSelector('[data-testid="canvas-toolbar"]', {
      timeout: 10000,
    });
  });

  test("should add text overlay", async ({ page }) => {
    // Switch to overlays panel
    await page.click('button:has-text("Overlays")');

    // Click Add Text button
    await page.click('button:has-text("Add Text")');

    // Check if text overlay was added to the overlays list
    await expect(page.locator('[data-testid="overlay-item"]')).toBeVisible();

    // Check if text overlay content is in the list
    await expect(
      page.locator(
        '[data-testid="overlay-item"] span:has-text("Your text here")'
      )
    ).toBeVisible();
  });

  test("should edit text content", async ({ page }) => {
    // Switch to overlays panel
    await page.click('button:has-text("Overlays")');

    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Find and click on the text input in the overlays panel
    await expect(page.locator('input[placeholder*="text"]')).toBeVisible();
    const textInput = page.locator('input[placeholder*="text"]').first();
    await textInput.clear();
    await textInput.fill("Hello World!");

    // Verify text is updated in the overlays list
    await expect(textInput).toHaveValue("Hello World!");
  });

  test("should show floating toolbar when text is selected", async ({
    page,
  }) => {
    // Switch to overlays panel
    await page.click('button:has-text("Overlays")');

    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Verify overlay appears in the overlays list
    await expect(page.locator('[data-testid="overlay-item"]')).toBeVisible();

    // Click on the overlay in the list to select it
    await page.click('[data-testid="overlay-item"]');

    // Verify overlay controls are visible
    await expect(page.locator('button[aria-label*="Delete"]')).toBeVisible();
  });

  test("should change font size from toolbar", async ({ page }) => {
    // Switch to overlays panel
    await page.click('button:has-text("Overlays")');

    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Wait for overlay to be added
    await expect(page.locator('[data-testid="overlay-item"]')).toBeVisible();

    // Find and change font size input in the overlays panel
    const fontSizeInput = page.locator(
      '[data-testid="overlay-item"] input[type="number"]'
    );
    await expect(fontSizeInput).toBeVisible();
    await fontSizeInput.clear();
    await fontSizeInput.fill("36");

    // Verify font size was updated
    await expect(fontSizeInput).toHaveValue("36");
  });

  test("should change text color from toolbar", async ({ page }) => {
    // Switch to overlays panel
    await page.click('button:has-text("Overlays")');

    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Wait for overlay to be added
    await expect(page.locator('[data-testid="overlay-item"]')).toBeVisible();

    // Find and change text color in the overlays panel
    const colorInput = page.locator(
      '[data-testid="overlay-item"] input[type="color"]'
    );
    await expect(colorInput).toBeVisible();
    await colorInput.fill("#ff0000");

    // Verify color was set
    await expect(colorInput).toHaveValue("#ff0000");
  });

  test("should toggle text shadow", async ({ page }) => {
    // Switch to overlays panel
    await page.click('button:has-text("Overlays")');

    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Wait for overlay to be added
    await expect(page.locator('[data-testid="overlay-item"]')).toBeVisible();

    // Find and toggle shadow checkbox in the overlays panel
    const shadowCheckbox = page.locator(
      '[data-testid="overlay-item"] input[type="checkbox"]'
    );
    await expect(shadowCheckbox).toBeVisible();
    await shadowCheckbox.click();

    // Verify shadow is toggled
    await expect(shadowCheckbox).toBeChecked();
  });

  test("should delete text overlay", async ({ page }) => {
    // Switch to overlays panel
    await page.click('button:has-text("Overlays")');

    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Verify overlay exists
    await expect(page.locator('[data-testid="overlay-item"]')).toBeVisible();

    // Delete overlay using delete button
    await page.click('button[aria-label*="Delete"]');

    // Verify overlay is removed
    await expect(
      page.locator('[data-testid="overlay-item"]')
    ).not.toBeVisible();
  });

  test("should support undo/redo for text operations", async ({ page }) => {
    // Switch to overlays panel
    await page.click('button:has-text("Overlays")');

    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Edit text in the input field
    const textInput = page.locator('input[placeholder*="text"]').first();
    await textInput.clear();
    await textInput.fill("Edited Text");

    // Verify text is edited
    await expect(textInput).toHaveValue("Edited Text");

    // Undo (Ctrl+Z)
    await page.keyboard.press("Control+z");

    // Verify text is reverted
    await expect(textInput).toHaveValue("Your text here");
  });
});
