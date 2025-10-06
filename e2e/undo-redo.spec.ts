import { test, expect } from "@playwright/test";

test.describe("Undo/Redo History", () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
    await page.goto("/");
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        if (!indexedDB) {
          resolve();
          return;
        }

        const deleteReq = indexedDB.deleteDatabase("SnapthumbSession");
        deleteReq.onsuccess = () => resolve();
        deleteReq.onerror = () => resolve(); // Continue even if delete fails
        deleteReq.onblocked = () => resolve(); // Continue even if blocked

        // Timeout after 5 seconds
        setTimeout(() => resolve(), 5000);
      });
    });
  });

  test("should show undo/redo buttons with proper accessibility labels", async ({
    page,
  }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('button:has-text("Start Creating")');

    // Check that undo/redo buttons are present
    const undoButton = page.locator('button[aria-label="Undo last action"]');
    const redoButton = page.locator(
      'button[aria-label="Redo last undone action"]'
    );

    await expect(undoButton).toBeVisible();
    await expect(redoButton).toBeVisible();

    // Check that buttons are initially disabled
    await expect(undoButton).toBeDisabled();
    await expect(redoButton).toBeDisabled();

    // Check tooltips
    await expect(undoButton).toHaveAttribute("title", "Undo (⌘Z)");
    await expect(redoButton).toHaveAttribute("title", "Redo (⌘⇧Z)");
  });

  test("should enable undo button after adding overlay", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('button:has-text("Start Creating")');

    // Initially undo should be disabled (no actions to undo yet)
    const undoButton = page.locator('button[aria-label="Undo last action"]');
    await expect(undoButton).toBeDisabled();

    // Add a text overlay
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Overlay"
    );
    await page.click('button:has-text("Add Text")');

    // Wait a moment for state to update
    await page.waitForTimeout(100);

    // Undo button should now be enabled
    await expect(undoButton).toBeEnabled();
  });

  test("should undo overlay addition", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('button:has-text("Start Creating")');

    // Add a text overlay
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Overlay"
    );
    await page.click('button:has-text("Add Text")');

    // Verify overlay was added
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    // Click undo button
    await page.click('button[aria-label="Undo last action"]');

    // Wait for state to update
    await page.waitForTimeout(1000);

    // Verify overlay was removed
    await expect(page.locator("text=Active Overlays (0)")).toBeVisible();
  });

  test("should redo overlay addition after undo", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('button:has-text("Start Creating")');

    // Add a text overlay
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Overlay"
    );
    await page.click('button:has-text("Add Text")');

    // Verify overlay was added
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    // Click undo button
    await page.click('button[aria-label="Undo last action"]');

    // Verify overlay was removed
    await expect(page.locator("text=Active Overlays (0)")).toBeVisible();

    // Redo button should now be enabled
    const redoButton = page.locator(
      'button[aria-label="Redo last undone action"]'
    );
    await expect(redoButton).toBeEnabled();

    // Click redo button
    await page.click('button[aria-label="Redo last undone action"]');

    // Verify overlay was added back
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();
  });

  test("should support keyboard shortcuts for undo/redo", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('button:has-text("Start Creating")');

    // Add a text overlay
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Overlay"
    );
    await page.click('button:has-text("Add Text")');

    // Verify overlay was added
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    // Use keyboard shortcut to undo (Cmd+Z on Mac, Ctrl+Z on Windows/Linux)
    await page.keyboard.press("Meta+z");

    // Verify overlay was removed
    await expect(page.locator("text=Active Overlays (0)")).toBeVisible();

    // Use keyboard shortcut to redo (Cmd+Shift+Z on Mac, Ctrl+Shift+Z on Windows/Linux)
    await page.keyboard.press("Meta+Shift+z");

    // Verify overlay was added back
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();
  });

  test("should handle multiple sequential undos and redos", async ({
    page,
  }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('button:has-text("Start Creating")');

    // Add multiple overlays
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Overlay 1"
    );
    await page.click('button:has-text("Add Text")');

    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Overlay 2"
    );
    await page.click('button:has-text("Add Text")');

    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Overlay 3"
    );
    await page.click('button:has-text("Add Text")');

    // Verify all overlays were added
    await expect(page.locator("text=Active Overlays (3)")).toBeVisible();

    // Undo all three additions
    await page.keyboard.press("Meta+z"); // Undo Overlay 3
    await expect(page.locator("text=Active Overlays (2)")).toBeVisible();

    await page.keyboard.press("Meta+z"); // Undo Overlay 2
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    await page.keyboard.press("Meta+z"); // Undo Overlay 1
    await expect(page.locator("text=Active Overlays (0)")).toBeVisible();

    // Redo all three additions
    await page.keyboard.press("Meta+Shift+z"); // Redo Overlay 1
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    await page.keyboard.press("Meta+Shift+z"); // Redo Overlay 2
    await expect(page.locator("text=Active Overlays (2)")).toBeVisible();

    await page.keyboard.press("Meta+Shift+z"); // Redo Overlay 3
    await expect(page.locator("text=Active Overlays (3)")).toBeVisible();
  });

  test("should disable redo after new action after undo", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('button:has-text("Start Creating")');

    // Add a text overlay
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Overlay"
    );
    await page.click('button:has-text("Add Text")');

    // Undo the addition
    await page.click('button[aria-label="Undo last action"]');

    // Redo should be enabled
    const redoButton = page.locator(
      'button[aria-label="Redo last undone action"]'
    );
    await expect(redoButton).toBeEnabled();

    // Add a new overlay
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "New Overlay"
    );
    await page.click('button:has-text("Add Text")');

    // Redo should now be disabled (branching)
    await expect(redoButton).toBeDisabled();
  });

  test("should maintain history state across page reload", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('button:has-text("Start Creating")');

    // Add a text overlay
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Overlay"
    );
    await page.click('button:has-text("Add Text")');

    // Verify overlay was added
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    // Reload the page
    await page.reload();

    // Wait for session restore to complete
    const restoreIndicator = page.locator("text=Restoring session...");
    try {
      await expect(restoreIndicator).toBeVisible({ timeout: 1000 });
    } catch {
      // Indicator might be too fast to catch, that's okay
    }
    await expect(restoreIndicator).not.toBeVisible({ timeout: 5000 });

    // Verify overlay was restored
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    // Undo should work on restored state
    const undoButton = page.locator('button[aria-label="Undo last action"]');
    await expect(undoButton).toBeEnabled();

    await page.click('button[aria-label="Undo last action"]');
    await expect(page.locator("text=Active Overlays (0)")).toBeVisible();
  });

  test("should handle undo/redo with canvas operations", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('button:has-text("Start Creating")');

    // Upload an image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");

    // Wait for image to load
    await expect(page.locator("text=📷 Image")).toBeVisible();

    // Initially undo should be disabled (no operations yet)
    const undoButton = page.locator('button[aria-label="Undo last action"]');
    await expect(undoButton).toBeDisabled();

    // Add a text overlay (this should create a history entry)
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Overlay"
    );
    await page.click('button:has-text("Add Text")');

    // Undo should now be enabled
    await expect(undoButton).toBeEnabled();

    // Undo the overlay addition
    await page.click('button[aria-label="Undo last action"]');
    await expect(page.locator("text=Active Overlays (0)")).toBeVisible();

    // Redo the overlay addition
    const redoButton = page.locator(
      'button[aria-label="Redo last undone action"]'
    );
    await page.click('button[aria-label="Redo last undone action"]');
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();
  });
});
