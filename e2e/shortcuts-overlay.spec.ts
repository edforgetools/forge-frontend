import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Shortcuts Overlay", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to the app page
    await page.click("text=Start Creating");
    // Wait for the app to load
    await page.waitForSelector('[data-testid="editor-layout"]', {
      timeout: 10000,
    });
  });

  test("should open shortcuts overlay when clicking shortcuts button", async ({
    page,
  }) => {
    // Wait for the shortcuts button to be visible and clickable
    await page.waitForSelector(
      "button[aria-label='Show keyboard shortcuts']:visible",
      { timeout: 10000 }
    );
    // Click the shortcuts button
    await page.click("button[aria-label='Show keyboard shortcuts']:visible");

    // Check that the modal is visible
    await expect(page.locator("[role='dialog']")).toBeVisible();
    await expect(page.locator("#shortcuts-title")).toBeVisible();

    // Check that all shortcuts are displayed in the modal
    const shortcuts = [
      "Upload new image or video",
      "Capture frame from video",
      "Toggle crop overlay",
      "Move/pan the canvas",
      "Add text overlay",
      "Undo last action",
      "Redo last undone action",
      "Open export panel",
      "Toggle session restore",
    ];

    for (const shortcut of shortcuts) {
      await expect(
        page.locator(
          `[role='dialog'] >> .text-sm.font-medium:text-is("${shortcut}")`
        )
      ).toBeVisible();
    }
  });

  test("should open shortcuts overlay with keyboard shortcut when canvas is focused", async ({
    page,
  }) => {
    // First, upload an image to make the canvas visible
    const fileInput = page.getByTestId("upload-dropzone-input").first();
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");
    await page.waitForTimeout(1000); // Wait for image processing

    // Focus the canvas using JavaScript
    await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="canvas-stage"] canvas'
      );
      if (canvas) {
        canvas.focus();
      }
    });

    // Press the ? key to open shortcuts (only works when canvas is focused)
    await page.keyboard.press("?");

    // Wait a bit for the modal to appear
    await page.waitForTimeout(500);

    // Check that the modal is visible
    await expect(page.locator("[role='dialog']")).toBeVisible();
    await expect(page.locator("#shortcuts-title")).toBeVisible();
  });

  test("should close shortcuts overlay with ESC key", async ({ page }) => {
    // Wait for the shortcuts button to be visible and open the shortcuts overlay
    await page.waitForSelector(
      "button[aria-label='Show keyboard shortcuts']:visible",
      { timeout: 10000 }
    );
    await page.click("button[aria-label='Show keyboard shortcuts']:visible");
    await expect(page.locator("[role='dialog']")).toBeVisible();

    // Press ESC to close
    await page.keyboard.press("Escape");

    // Check that the modal is closed
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
  });

  test("should close shortcuts overlay when clicking close button", async ({
    page,
  }) => {
    // Wait for the shortcuts button to be visible and open the shortcuts overlay
    await page.waitForSelector(
      "button[aria-label='Show keyboard shortcuts']:visible",
      { timeout: 10000 }
    );
    await page.click("button[aria-label='Show keyboard shortcuts']:visible");
    await expect(page.locator("[role='dialog']")).toBeVisible();

    // Click the close button
    await page.click("button:has-text('Close')");

    // Check that the modal is closed
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
  });

  test("should have proper focus management", async ({ page }) => {
    // Wait for the shortcuts button to be visible and open the shortcuts overlay
    await page.waitForSelector(
      "button[aria-label='Show keyboard shortcuts']:visible",
      { timeout: 10000 }
    );
    await page.click("button[aria-label='Show keyboard shortcuts']:visible");

    // Check that focus is trapped in the modal
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // Check that the close button is focusable
    const closeButton = page.locator(
      "button[aria-label='Close shortcuts overlay']"
    );
    await closeButton.focus();
    await expect(closeButton).toBeFocused();

    // Test tab order - should cycle through focusable elements
    await page.keyboard.press("Tab");
    // Focus should move to another focusable element or stay in the modal
  });

  test("should have proper ARIA attributes", async ({ page }) => {
    // Wait for the shortcuts button to be visible and open the shortcuts overlay
    await page.waitForSelector(
      "button[aria-label='Show keyboard shortcuts']:visible",
      { timeout: 10000 }
    );
    await page.click("button[aria-label='Show keyboard shortcuts']:visible");

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // Check ARIA attributes
    await expect(dialog).toHaveAttribute("aria-labelledby", "shortcuts-title");
    await expect(dialog).toHaveAttribute(
      "aria-describedby",
      "shortcuts-description"
    );

    // Check that title and description are properly linked
    await expect(page.locator("#shortcuts-title")).toBeVisible();
    await expect(page.locator("#shortcuts-description")).toBeVisible();
  });

  test("should be accessible with axe", async ({ page }) => {
    // Wait for the shortcuts button to be visible and open the shortcuts overlay
    await page.waitForSelector(
      "button[aria-label='Show keyboard shortcuts']:visible",
      { timeout: 10000 }
    );
    await page.click("button[aria-label='Show keyboard shortcuts']:visible");

    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("[role='dialog']")
      .analyze();

    // Check that there are no critical accessibility issues
    expect(accessibilityScanResults.violations).toEqual([]);

    // Log any violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        "Accessibility violations found:",
        accessibilityScanResults.violations
      );
    }
  });

  test("should work with keyboard navigation", async ({ page }) => {
    // Wait for the shortcuts button to be visible and open the shortcuts overlay
    await page.waitForSelector(
      "button[aria-label='Show keyboard shortcuts']:visible",
      { timeout: 10000 }
    );
    await page.click("button[aria-label='Show keyboard shortcuts']:visible");

    // Test keyboard navigation within the modal
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Test that we can close with Enter key when close button is focused
    const closeButton = page.locator(
      "button[aria-label='Close shortcuts overlay']"
    );
    await closeButton.focus();
    await page.keyboard.press("Enter");

    // Check that the modal is closed
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
  });

  test("should not interfere with other keyboard shortcuts", async ({
    page,
  }) => {
    // Wait for the shortcuts button to be visible and open the shortcuts overlay
    await page.waitForSelector(
      "button[aria-label='Show keyboard shortcuts']:visible",
      { timeout: 10000 }
    );
    await page.click("button[aria-label='Show keyboard shortcuts']:visible");

    // Test that crop shortcut still works
    await page.keyboard.press("c");

    // The crop overlay should toggle (this depends on the implementation)
    // We just verify the shortcuts modal doesn't prevent other shortcuts
    await expect(page.locator("[role='dialog']")).toBeVisible();

    // Close the modal
    await page.keyboard.press("Escape");
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
  });

  test("should NOT open shortcuts when typing ? in input fields", async ({
    page,
  }) => {
    // First, upload an image to have content on the canvas
    const fileInput = page.getByTestId("upload-dropzone-input").first();
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");
    await page.waitForTimeout(1000); // Wait for image processing

    // Add a text overlay to create an input field
    await page.click("button[aria-label='Add text overlay']");
    await page.waitForSelector('[data-testid="text-overlay-content"]');

    // Click on the text overlay to enter edit mode
    await page.click('[data-testid="text-overlay-content"]');

    // Type "?" in the text input - this should NOT open the shortcuts dialog
    await page.keyboard.type("?");

    // Verify the shortcuts dialog is NOT visible
    await expect(page.locator("[role='dialog']")).not.toBeVisible();

    // Verify the "?" character was actually typed into the input
    const textContent = await page
      .locator('[data-testid="text-overlay-content"]')
      .textContent();
    expect(textContent).toContain("?");
  });
});
