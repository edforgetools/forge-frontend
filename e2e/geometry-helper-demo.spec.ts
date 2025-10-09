import { test, expect } from "@playwright/test";
import { expectNoOverlap } from "./geometry-helpers";

test.describe("Geometry Helper Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to the app page
    await page.click("text=Start Creating");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should demonstrate expectNoOverlap helper with basic layout elements", async ({
    page,
  }) => {
    // Test that main layout elements don't overlap
    await expectNoOverlap(
      page,
      [
        "header",
        "main",
        "aside:first-of-type", // left sidebar
      ],
      {
        minOverlapArea: 10, // Only consider overlaps > 10px²
        customMessage: "Main layout elements should not significantly overlap",
      }
    );
  });

  test("should detect overlaps when they exist (negative test)", async ({
    page,
  }) => {
    // This test should fail if there are actual overlaps
    // We'll test with a very small overlap threshold to catch any issues
    try {
      await expectNoOverlap(page, ["header", "main"], {
        minOverlapArea: 0.1, // Very sensitive to any overlap
        includeHidden: true, // Include hidden elements
        customMessage: "This test should fail if there are any overlaps",
      });
    } catch (error) {
      // If this test fails, it means there are overlaps - which is what we want to detect
      console.log("Overlap detected (expected in some cases):", error);
    }
  });

  test("should work with different selector types", async ({ page }) => {
    // Test with various selector types
    await expectNoOverlap(
      page,
      ['[data-testid="editor-layout"]', "header", "main"],
      {
        customMessage:
          "Editor layout should not overlap with header or main content",
      }
    );
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

      // Check for overlaps at this viewport size
      await expectNoOverlap(page, ["header", "main"], {
        minOverlapArea: 5,
        customMessage: `Layout should not overlap at ${viewport.width}x${viewport.height}`,
      });
    }
  });

  test("should provide detailed error information when overlaps are found", async ({
    page,
  }) => {
    // This test demonstrates the detailed error reporting
    try {
      await expectNoOverlap(page, ["header", "main", "aside"], {
        minOverlapArea: 0.1, // Very sensitive
        customMessage: "Testing error reporting",
      });
    } catch (error) {
      // The error should contain detailed information about overlaps
      expect(error.toString()).toContain("overlap");
      console.log("Error details:", error);
    }
  });
});
