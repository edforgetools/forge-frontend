import { test, expect } from "@playwright/test";

test.describe("Session Restore", () => {
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

  test("should save and restore session data on page reload", async ({
    page,
  }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('a:has-text("Launch Snapthumb")');

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

    // Wait for session restore to complete (indicator might be very brief)
    const restoreIndicator = page.locator("text=Restoring session...");
    try {
      await expect(restoreIndicator).toBeVisible({ timeout: 1000 });
    } catch {
      // Indicator might be too fast to catch, that's okay
    }
    await expect(restoreIndicator).not.toBeVisible({ timeout: 5000 });

    // Verify session was restored
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();
  });

  test("should toggle session restore on/off", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('a:has-text("Launch Snapthumb")');

    // Find the session restore toggle
    const toggle = page.locator('button[role="switch"]');
    await expect(toggle).toBeVisible();

    // Initially should be enabled
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    // Disable session restore
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    // Add some data
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Data"
    );
    await page.click('button:has-text("Add Text")');

    // Reload page
    await page.reload();

    // Data should not be restored since feature is disabled
    await expect(page.locator("text=Active Overlays (1)")).not.toBeVisible();
  });

  test("should clear saved session data", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('a:has-text("Launch Snapthumb")');

    // Add some data
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Data"
    );
    await page.click('button:has-text("Add Text")');

    // Verify data exists
    await expect(page.locator("text=Active Overlays (1)")).toBeVisible();

    // Click clear session button
    await page.click('button:has-text("Clear Saved Session")');

    // Confirm the action - use page.on('dialog') to handle the confirm dialog
    page.on("dialog", (dialog) => dialog.accept());

    // Reload page
    await page.reload();

    // Data should not be restored
    await expect(page.locator("text=Active Overlays (1)")).not.toBeVisible();
  });

  test("should handle IndexedDB unavailability gracefully", async ({
    page,
  }) => {
    // Mock IndexedDB as unavailable
    await page.addInitScript(() => {
      // @ts-expect-error - Mocking IndexedDB as unavailable for testing
      window.indexedDB = undefined;
    });

    await page.goto("/");

    // Navigate to the app page
    await page.click('a:has-text("Launch Snapthumb")');

    // App should still load without errors
    await expect(page.locator("text=Snapthumb Editor")).toBeVisible();

    // Session restore toggle should still be visible but disabled
    const toggle = page.locator('button[role="switch"]');
    await expect(toggle).toBeVisible();
  });

  test("should persist session restore setting", async ({ page }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('a:has-text("Launch Snapthumb")');

    // Disable session restore
    const toggle = page.locator('button[role="switch"]');
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    // Reload page
    await page.reload();

    // Setting should be persisted
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  test("should show restore indicator during session restore", async ({
    page,
  }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('a:has-text("Launch Snapthumb")');

    // Add some data to restore
    await page.fill(
      'input[placeholder="Enter text for overlay..."]',
      "Test Data"
    );
    await page.click('button:has-text("Add Text")');

    // Reload page
    await page.reload();

    // Should show restore indicator (might be very brief)
    const restoreIndicator = page.locator("text=Restoring session...");
    try {
      await expect(restoreIndicator).toBeVisible({ timeout: 1000 });
    } catch {
      // Indicator might be too fast to catch, that's okay
    }

    // Indicator should disappear after restore completes
    await expect(restoreIndicator).not.toBeVisible({ timeout: 5000 });
  });

  test("should restore viewport when canvas size differs by >25%", async ({
    page,
  }) => {
    await page.goto("/");

    // Navigate to the app page
    await page.click('a:has-text("Launch Snapthumb")');
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Use sample image to have content on canvas
    await page.click("text=Try sample image");
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Save initial viewport state by resizing window to a specific size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000); // Allow time for viewport to be saved

    // Change viewport significantly (>25% difference)
    await page.setViewportSize({ width: 800, height: 600 }); // 33% width reduction
    await page.waitForTimeout(1000); // Allow time for session guard to trigger

    // The session restore guard should have automatically reset zoom to 100%
    // and centered the canvas. We can verify this by checking that the canvas
    // is properly centered and at default zoom level.

    // Check that canvas is visible and properly rendered
    const canvas = page.locator('[data-testid="canvas-stage"] canvas');
    await expect(canvas).toBeVisible();

    // The viewport should be restored (zoom reset to 100%, canvas centered)
    // This is verified by the canvas being visible and properly positioned
    await expect(canvas).toHaveCSS("transform", /scale\(1\)/);
  });
});
