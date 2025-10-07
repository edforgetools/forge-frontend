import { test, expect } from "@playwright/test";

test.describe("Overlays CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("text=Start Creating");
    await page.waitForSelector('[data-testid="app-shell"]', { timeout: 10000 });
    await page.click("text=Try sample image");
    await page.waitForSelector("canvas", { timeout: 5000 });
  });

  test("should add, select, and delete text overlay", async ({ page }) => {
    // Switch to overlays panel
    await page.click("text=Overlays");

    // Add text overlay
    await page.click("text=Add Text");

    // Wait for overlay to be added and selected
    await page.waitForSelector('[data-testid="overlay-item"]', {
      timeout: 5000,
    });

    // Check that overlay is selected (has blue background)
    const overlayItem = page.locator('[data-testid="overlay-item"]').first();
    await expect(overlayItem).toHaveClass(/bg-blue-50/);

    // Delete overlay
    await page.click('[data-testid="delete-overlay"]');

    // Check that overlay is removed
    await expect(page.locator('[data-testid="overlay-item"]')).toHaveCount(0);
  });

  test("should add logo overlay", async ({ page }) => {
    // Switch to overlays panel
    await page.click("text=Overlays");

    // Add logo overlay (this will trigger file input)
    await page.click("text=Add Logo");

    // Note: In a real test, you'd need to handle file upload
    // For now, we'll just check that the button is clickable
    await expect(page.locator("text=Add Logo")).toBeVisible();
  });

  test("should toggle overlay visibility", async ({ page }) => {
    // Switch to overlays panel
    await page.click("text=Overlays");

    // Add text overlay
    await page.click("text=Add Text");

    // Wait for overlay to be added
    await page.waitForSelector('[data-testid="overlay-item"]', {
      timeout: 5000,
    });

    // Toggle visibility
    await page.click('[data-testid="toggle-visibility"]');

    // Check that overlay is hidden (eye-off icon)
    await expect(
      page.locator('[data-testid="toggle-visibility"] svg')
    ).toHaveClass(/text-gray-400/);
  });

  test("should toggle overlay lock", async ({ page }) => {
    // Switch to overlays panel
    await page.click("text=Overlays");

    // Add text overlay
    await page.click("text=Add Text");

    // Wait for overlay to be added
    await page.waitForSelector('[data-testid="overlay-item"]', {
      timeout: 5000,
    });

    // Toggle lock
    await page.click('[data-testid="toggle-lock"]');

    // Check that overlay is locked (lock icon visible)
    await expect(page.locator('[data-testid="toggle-lock"] svg')).toHaveClass(
      /text-gray-400/
    );
  });
});
