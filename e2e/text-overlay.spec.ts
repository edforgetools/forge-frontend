import { test, expect } from "@playwright/test";

test.describe("Text Overlay Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("button:has-text('Start Editing')");

    // Upload a test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");
    await page.waitForSelector('[data-testid="canvas-stage"]');
  });

  test("should add text overlay", async ({ page }) => {
    // Click Add Text button
    await page.click('button:has-text("Add Text")');

    // Verify text overlay is added and selected
    await expect(
      page.locator('[data-testid="text-overlay-content"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="text-overlay-content"]')
    ).toContainText("Your text here");
  });

  test("should edit text content", async ({ page }) => {
    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Double-click to edit text
    await page.locator('[data-testid="text-overlay-content"]').dblclick();

    // Type new text
    await page.keyboard.type("Hello World!");
    await page.keyboard.press("Enter");

    // Verify text is updated
    await expect(
      page.locator('[data-testid="text-overlay-content"]')
    ).toContainText("Hello World!");
  });

  test("should show floating toolbar when text is selected", async ({
    page,
  }) => {
    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Click on text overlay to select it
    await page.locator('[data-testid="text-overlay-content"]').click();

    // Verify toolbar appears
    await expect(page.locator('button:has-text("Close")')).toBeVisible();
  });

  test("should change font size from toolbar", async ({ page }) => {
    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Select text overlay
    await page.locator('[data-testid="text-overlay-content"]').click();

    // Wait for toolbar to appear
    await expect(page.locator('input[type="number"]')).toBeVisible();

    // Change font size
    const fontSizeInput = page.locator('input[type="number"]').first();
    await fontSizeInput.fill("36");
    await page.keyboard.press("Enter");

    // Verify font size changed (check computed style)
    const textElement = page.locator('[data-testid="text-overlay-content"]');
    const fontSize = await textElement.evaluate(
      (el) => window.getComputedStyle(el).fontSize
    );
    expect(fontSize).toBe("36px");
  });

  test("should change text color from toolbar", async ({ page }) => {
    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Select text overlay
    await page.locator('[data-testid="text-overlay-content"]').click();

    // Wait for toolbar to appear
    await expect(page.locator('input[type="color"]')).toBeVisible();

    // Change text color
    const colorInput = page.locator('input[type="color"]');
    await colorInput.fill("#ff0000");

    // Verify color changed
    const textElement = page.locator('[data-testid="text-overlay-content"]');
    const color = await textElement.evaluate(
      (el) => window.getComputedStyle(el).color
    );
    expect(color).toBe("rgb(255, 0, 0)");
  });

  test("should toggle text shadow", async ({ page }) => {
    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Select text overlay
    await page.locator('[data-testid="text-overlay-content"]').click();

    // Wait for toolbar to appear
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();

    // Toggle shadow
    const shadowCheckbox = page.locator('input[type="checkbox"]');
    await shadowCheckbox.click();

    // Verify shadow is applied
    const textElement = page.locator('[data-testid="text-overlay-content"]');
    const textShadow = await textElement.evaluate(
      (el) => window.getComputedStyle(el).textShadow
    );
    expect(textShadow).not.toBe("none");
  });

  test("should delete text overlay", async ({ page }) => {
    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Verify overlay exists
    await expect(
      page.locator('[data-testid="text-overlay-content"]')
    ).toBeVisible();

    // Delete overlay from panel
    await page.click('[data-testid="delete-overlay"]');

    // Verify overlay is removed
    await expect(
      page.locator('[data-testid="text-overlay-content"]')
    ).not.toBeVisible();
  });

  test("should support undo/redo for text operations", async ({ page }) => {
    // Add text overlay
    await page.click('button:has-text("Add Text")');

    // Edit text
    await page.locator('[data-testid="text-overlay-content"]').dblclick();
    await page.keyboard.type("Edited Text");
    await page.keyboard.press("Enter");

    // Verify text is edited
    await expect(
      page.locator('[data-testid="text-overlay-content"]')
    ).toContainText("Edited Text");

    // Undo (Ctrl+Z)
    await page.keyboard.press("Control+z");

    // Verify text is reverted
    await expect(
      page.locator('[data-testid="text-overlay-content"]')
    ).toContainText("Your text here");
  });
});
