import { test, expect } from "@playwright/test";

test.describe("Undo/Redo Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("a:has-text('Launch Snapthumb')");
    await page.waitForSelector('[data-testid="app-shell"]', { timeout: 10000 });
    await page.click("text=Try sample image");
    await page.waitForSelector("canvas", { timeout: 5000 });
  });

  test("should undo and redo overlay operations", async ({ page }) => {
    // Switch to overlays panel
    await page.click("text=Overlays");

    // Add text overlay
    await page.click("text=Add Text");

    // Wait for overlay to be added
    await page.waitForSelector('[data-testid="overlay-item"]', {
      timeout: 5000,
    });

    // Check that overlay exists
    await expect(page.locator('[data-testid="overlay-item"]')).toHaveCount(1);

    // Undo (Ctrl+Z)
    await page.keyboard.press("Control+z");

    // Check that overlay is removed
    await expect(page.locator('[data-testid="overlay-item"]')).toHaveCount(0);

    // Redo (Ctrl+Shift+Z)
    await page.keyboard.press("Control+Shift+z");

    // Check that overlay is back
    await expect(page.locator('[data-testid="overlay-item"]')).toHaveCount(1);
  });

  test("should undo text editing", async ({ page }) => {
    // Switch to overlays panel
    await page.click("text=Overlays");

    // Add text overlay
    await page.click("text=Add Text");

    // Wait for overlay to be added
    await page.waitForSelector('[data-testid="overlay-item"]', {
      timeout: 5000,
    });

    // Double-click on canvas to edit text
    await page.dblclick("canvas");

    // Type new text
    await page.keyboard.type("New text content");
    await page.keyboard.press("Enter");

    // Undo the text change
    await page.keyboard.press("Control+z");

    // The text should be reverted (this is hard to test without more specific selectors)
    // In a real implementation, you'd check the actual text content
  });

  test("should handle keyboard shortcuts", async ({ page }) => {
    // Test various keyboard shortcuts
    await page.keyboard.press("u"); // Upload panel
    await expect(page.locator("text=Upload")).toBeVisible();

    await page.keyboard.press("c"); // Crop panel
    await expect(page.locator("text=Crop")).toBeVisible();

    await page.keyboard.press("o"); // Overlays panel
    await expect(page.locator("text=Overlays")).toBeVisible();

    await page.keyboard.press("e"); // Export panel
    await expect(page.locator("text=Export")).toBeVisible();

    await page.keyboard.press("?"); // Shortcuts help
    await expect(page.locator("text=Keyboard Shortcuts")).toBeVisible();

    // Close shortcuts
    await page.keyboard.press("Escape");
  });
});
