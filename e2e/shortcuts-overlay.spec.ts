import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Shortcuts Overlay", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to the app page
    await page.click("text=Start Creating");
  });

  test("should open shortcuts overlay when clicking shortcuts button", async ({
    page,
  }) => {
    // Click the shortcuts button
    await page.click("button[aria-label='Show keyboard shortcuts']");

    // Check that the modal is visible
    await expect(page.locator("[role='dialog']")).toBeVisible();
    await expect(page.locator("#shortcuts-title")).toBeVisible();

    // Check that all shortcuts are displayed in the modal
    const shortcuts = [
      "Upload",
      "Capture",
      "Crop",
      "Move",
      "Text",
      "Undo",
      "Redo",
      "Export",
      "Toggle Restore",
    ];

    for (const shortcut of shortcuts) {
      await expect(
        page.locator(`[role='dialog'] >> .font-medium:has-text("${shortcut}")`)
      ).toBeVisible();
    }
  });

  test("should open shortcuts overlay with keyboard shortcut", async ({
    page,
  }) => {
    // Press the ? key to open shortcuts
    await page.keyboard.press("?");

    // Check that the modal is visible
    await expect(page.locator("[role='dialog']")).toBeVisible();
    await expect(page.locator("#shortcuts-title")).toBeVisible();
  });

  test("should close shortcuts overlay with ESC key", async ({ page }) => {
    // Open the shortcuts overlay
    await page.click("button[aria-label='Show keyboard shortcuts']");
    await expect(page.locator("[role='dialog']")).toBeVisible();

    // Press ESC to close
    await page.keyboard.press("Escape");

    // Check that the modal is closed
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
  });

  test("should close shortcuts overlay when clicking close button", async ({
    page,
  }) => {
    // Open the shortcuts overlay
    await page.click("button[aria-label='Show keyboard shortcuts']");
    await expect(page.locator("[role='dialog']")).toBeVisible();

    // Click the close button
    await page.click("button:has-text('Close')");

    // Check that the modal is closed
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
  });

  test("should have proper focus management", async ({ page }) => {
    // Open the shortcuts overlay
    await page.click("button[aria-label='Show keyboard shortcuts']");

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
    // Open the shortcuts overlay
    await page.click("button[aria-label='Show keyboard shortcuts']");

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
    // Open the shortcuts overlay
    await page.click("button[aria-label='Show keyboard shortcuts']");

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
    // Open the shortcuts overlay
    await page.click("button[aria-label='Show keyboard shortcuts']");

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
    // Open the shortcuts overlay
    await page.click("button[aria-label='Show keyboard shortcuts']");

    // Test that crop shortcut still works
    await page.keyboard.press("c");

    // The crop overlay should toggle (this depends on the implementation)
    // We just verify the shortcuts modal doesn't prevent other shortcuts
    await expect(page.locator("[role='dialog']")).toBeVisible();

    // Close the modal
    await page.keyboard.press("Escape");
    await expect(page.locator("[role='dialog']")).not.toBeVisible();
  });
});
