import { test, expect } from "@playwright/test";

test.describe("Canvas Toolbar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Upload a test image first
    await page.setInputFiles(
      '[data-testid="upload-input"]',
      "e2e/fixtures/test-image.png"
    );
    await page.waitForSelector('[data-testid="canvas-stage"]', {
      timeout: 10000,
    });
  });

  test("should display canvas toolbar with all controls", async ({ page }) => {
    // Check that the toolbar is visible
    await expect(page.locator('[data-testid="canvas-toolbar"]')).toBeVisible();

    // Check ratio selector
    await expect(page.locator('[data-testid="ratio-selector"]')).toBeVisible();

    // Check grid toggle
    await expect(page.locator('[data-testid="grid-toggle"]')).toBeVisible();

    // Check safe zone toggle
    await expect(
      page.locator('[data-testid="safe-zone-toggle"]')
    ).toBeVisible();

    // Check zoom controls
    await expect(page.locator('[data-testid="zoom-out"]')).toBeVisible();
    await expect(page.locator('[data-testid="zoom-slider"]')).toBeVisible();
    await expect(page.locator('[data-testid="zoom-in"]')).toBeVisible();
    await expect(page.locator('[data-testid="reset-view"]')).toBeVisible();

    // Check current ratio and zoom display
    await expect(page.locator('[data-testid="canvas-info"]')).toBeVisible();
  });

  test("should change aspect ratio when ratio preset is selected", async ({
    page,
  }) => {
    // Test 16:9 ratio (default)
    await expect(page.locator('[data-testid="canvas-info"]')).toContainText(
      "16:9"
    );

    // Change to 1:1 ratio
    await page.click('[data-testid="ratio-selector"]');
    await page.click("text=1:1 (Square)");
    await expect(page.locator('[data-testid="canvas-info"]')).toContainText(
      "1:1"
    );

    // Change to 9:16 ratio
    await page.click('[data-testid="ratio-selector"]');
    await page.click("text=9:16 (Portrait)");
    await expect(page.locator('[data-testid="canvas-info"]')).toContainText(
      "9:16"
    );
  });

  test("should toggle grid visibility", async ({ page }) => {
    // Grid should be off by default
    await expect(page.locator('[data-testid="grid-toggle"]')).toHaveClass(
      /outline/
    );

    // Click to enable grid
    await page.click('[data-testid="grid-toggle"]');
    await expect(page.locator('[data-testid="grid-toggle"]')).toHaveClass(
      /bg-primary/
    );

    // Click to disable grid
    await page.click('[data-testid="grid-toggle"]');
    await expect(page.locator('[data-testid="grid-toggle"]')).toHaveClass(
      /outline/
    );
  });

  test("should toggle safe zone visibility", async ({ page }) => {
    // Safe zone should be off by default
    await expect(page.locator('[data-testid="safe-zone-toggle"]')).toHaveClass(
      /outline/
    );

    // Click to enable safe zone
    await page.click('[data-testid="safe-zone-toggle"]');
    await expect(page.locator('[data-testid="safe-zone-toggle"]')).toHaveClass(
      /bg-primary/
    );

    // Click to disable safe zone
    await page.click('[data-testid="safe-zone-toggle"]');
    await expect(page.locator('[data-testid="safe-zone-toggle"]')).toHaveClass(
      /outline/
    );
  });

  test("should change zoom level", async ({ page }) => {
    // Test zoom in
    await page.click('[data-testid="zoom-in"]');
    await expect(page.locator('[data-testid="canvas-info"]')).toContainText(
      "120%"
    );

    // Test zoom out
    await page.click('[data-testid="zoom-out"]');
    await expect(page.locator('[data-testid="canvas-info"]')).toContainText(
      "100%"
    );

    // Test reset view
    await page.click('[data-testid="zoom-in"]');
    await page.click('[data-testid="zoom-in"]');
    await page.click('[data-testid="reset-view"]');
    await expect(page.locator('[data-testid="canvas-info"]')).toContainText(
      "100%"
    );
  });

  test("should update zoom with slider", async ({ page }) => {
    const slider = page.locator('[data-testid="zoom-slider"]');

    // Move slider to increase zoom
    await slider.fill("2");
    await expect(page.locator('[data-testid="canvas-info"]')).toContainText(
      "200%"
    );

    // Move slider to decrease zoom
    await slider.fill("0.5");
    await expect(page.locator('[data-testid="canvas-info"]')).toContainText(
      "50%"
    );
  });
});
