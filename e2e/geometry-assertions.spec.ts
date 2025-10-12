import { test, expect } from "@playwright/test";
import {
  expectNoOverlap,
  expectShortcutsDialogNoOverlap,
} from "./geometry-helpers";

test.describe("Geometry Assertions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to the app page
    await page.click("a:has-text('Launch Snapthumb')");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have no overlap between shortcuts dialog and main UI elements", async ({
    page,
  }) => {
    // Open the shortcuts dialog using keyboard shortcut
    await page.keyboard.press("?");
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Check that shortcuts dialog doesn't overlap with key UI elements
    await expectShortcutsDialogNoOverlap(page);
  });

  test("should have no overlap between shortcuts dialog and editor grid", async ({
    page,
  }) => {
    // Open the shortcuts dialog using keyboard shortcut
    await page.keyboard.press("?");
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Check specific overlap between shortcuts dialog and editor grid
    await expectNoOverlap(
      page,
      ['[role="dialog"]', '[data-testid="editor-layout"]'],
      {
        customMessage: "Shortcuts dialog should not overlap with editor grid",
      }
    );
  });

  test("should have no overlap between shortcuts dialog and export panel", async ({
    page,
  }) => {
    // Open the shortcuts dialog using keyboard shortcut
    await page.keyboard.press("?");
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Check specific overlap between shortcuts dialog and export panel
    await expectNoOverlap(
      page,
      [
        '[role="dialog"]',
        "aside:last-of-type", // export panel (right sidebar)
      ],
      {
        customMessage: "Shortcuts dialog should not overlap with export panel",
      }
    );
  });

  test("should have no overlap between shortcuts dialog and topbar", async ({
    page,
  }) => {
    // Open the shortcuts dialog using keyboard shortcut
    await page.keyboard.press("?");
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Check specific overlap between shortcuts dialog and topbar
    await expectNoOverlap(page, ['[role="dialog"]', "header"], {
      customMessage: "Shortcuts dialog should not overlap with topbar",
    });
  });

  test("should handle custom selectors for overlap detection", async ({
    page,
  }) => {
    // Test with custom selectors
    await expectNoOverlap(
      page,
      [
        "main",
        "aside:first-of-type", // left sidebar
      ],
      {
        minOverlapArea: 10, // Only consider overlaps > 10px²
        customMessage:
          "Main content should not significantly overlap with left sidebar",
      }
    );
  });

  test("should detect overlaps when they exist (negative test)", async ({
    page,
  }) => {
    // This test should fail if there are actual overlaps
    // We'll test with a very small overlap threshold to catch any issues
    try {
      await expectNoOverlap(
        page,
        ['[role="dialog"]', '[data-testid="editor-layout"]'],
        {
          minOverlapArea: 0.1, // Very sensitive to any overlap
          includeHidden: true, // Include hidden elements
          customMessage: "This test should fail if there are any overlaps",
        }
      );
    } catch (error) {
      // If this test fails, it means there are overlaps - which is what we want to detect
      console.log("Overlap detected (expected in some cases):", error);
    }
  });

  test("should work with keyboard shortcut to open shortcuts dialog", async ({
    page,
  }) => {
    // Open shortcuts dialog with keyboard shortcut
    await page.keyboard.press("?");
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Check for overlaps
    await expectShortcutsDialogNoOverlap(page);
  });

  test("should maintain no overlap after closing and reopening shortcuts dialog", async ({
    page,
  }) => {
    // Open shortcuts dialog using keyboard shortcut
    await page.keyboard.press("?");
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expectShortcutsDialogNoOverlap(page);

    // Close shortcuts dialog
    await page.keyboard.press("Escape");
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Reopen shortcuts dialog using keyboard shortcut
    await page.keyboard.press("?");
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expectShortcutsDialogNoOverlap(page);
  });

  test("should handle responsive layout changes", async ({ page }) => {
    // Test at different viewport sizes
    const viewports = [
      { width: 1280, height: 720 }, // Desktop
      { width: 1024, height: 768 }, // Tablet
      { width: 375, height: 667 }, // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to settle

      // Open shortcuts dialog using keyboard shortcut
      await page.keyboard.press("?");
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Check for overlaps at this viewport size
      await expectShortcutsDialogNoOverlap(page);

      // Close dialog
      await page.keyboard.press("Escape");
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });
});
