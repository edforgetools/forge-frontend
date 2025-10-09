import { test, expect } from "@playwright/test";

test.describe("Snapthumb Overlay Regression Tests", () => {
  // Test configurations for different viewport sizes
  const viewports = [
    { name: "mobile", width: 375, height: 812 },
    { name: "desktop", width: 1366, height: 768 },
  ];

  // Helper function to check if any element is outside viewport
  async function checkElementsInViewport(
    page: import("@playwright/test").Page
  ) {
    const elements = await page.locator("*").all();
    const viewport = page.viewportSize();

    if (!viewport) {
      throw new Error("Viewport size is not available");
    }

    for (const element of elements) {
      const box = await element.boundingBox();
      if (box) {
        // Check if element extends beyond viewport bounds
        const isOutsideViewport =
          box.x < 0 ||
          box.y < 0 ||
          box.x + box.width > viewport.width ||
          box.y + box.height > viewport.height;

        if (isOutsideViewport) {
          const tagName = await element.evaluate((el: Element) => el.tagName);
          const className = await element.getAttribute("class");
          throw new Error(
            `Element ${tagName}${
              className ? `.${className.split(" ")[0]}` : ""
            } is outside viewport bounds. ` +
              `Position: (${box.x}, ${box.y}), Size: ${box.width}x${box.height}, Viewport: ${viewport.width}x${viewport.height}`
          );
        }
      }
    }
  }

  // Helper function to check overlay coverage
  async function checkOverlayCoverage(
    page: import("@playwright/test").Page,
    overlaySelector: string
  ) {
    const overlay = page.locator(overlaySelector);
    if (await overlay.isVisible()) {
      const overlayBox = await overlay.boundingBox();
      const viewport = page.viewportSize();

      if (overlayBox && viewport) {
        // Check if overlay covers 100% of viewport
        const coverageX = overlayBox.width / viewport.width;
        const coverageY = overlayBox.height / viewport.height;

        expect(coverageX).toBeGreaterThanOrEqual(0.95); // Allow 5% tolerance
        expect(coverageY).toBeGreaterThanOrEqual(0.95);
      }
    }
  }

  // Helper function to check elementFromPoint returns overlay
  async function checkElementFromPoint(
    page: import("@playwright/test").Page,
    overlaySelector: string,
    testX: number = 10,
    testY: number = 10
  ) {
    const overlay = page.locator(overlaySelector);
    if (await overlay.isVisible()) {
      // Check if the element at point is the overlay or a child of the overlay
      const isOverlayElement = await page.evaluate(
        ({ x, y, overlaySelector }) => {
          const element = document.elementFromPoint(x, y);
          if (!element) return false;

          const overlay = document.querySelector(overlaySelector);
          if (!overlay) return false;

          return overlay.contains(element) || overlay === element;
        },
        { x: testX, y: testY, overlaySelector }
      );

      expect(isOverlayElement).toBe(true);
    }
  }

  // Helper function to check z-index layering
  async function checkZIndexLayering(
    page: import("@playwright/test").Page,
    dialogSelector: string,
    headerSelector: string
  ) {
    const dialog = page.locator(dialogSelector);
    const header = page.locator(headerSelector);

    if ((await dialog.isVisible()) && (await header.isVisible())) {
      const dialogZ = await dialog.evaluate((el: Element) => {
        const styles = window.getComputedStyle(el);
        return parseInt(styles.zIndex) || 0;
      });

      const headerZ = await header.evaluate((el: Element) => {
        const styles = window.getComputedStyle(el);
        return parseInt(styles.zIndex) || 0;
      });

      // Dialog should have higher z-index than header
      expect(dialogZ).toBeGreaterThan(headerZ);
    }
  }

  // Test Case 1: Home Page
  viewports.forEach(({ name, width, height }) => {
    test.describe(`Home Page - ${name} (${width}×${height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
      });

      test("should display without elements outside viewport", async ({
        page,
      }) => {
        // Wait for content to load
        await expect(page.locator("h1")).toContainText("Snapthumb");
        await expect(
          page.locator('button:has-text("Start Creating")')
        ).toBeVisible();

        // Assert: no element's bounding rect exceeds viewport
        await checkElementsInViewport(page);
      });

      test("should have proper layout at viewport size", async ({ page }) => {
        // Wait for content to load
        await expect(page.locator("h1")).toContainText("Snapthumb");

        // Take screenshot for visual regression
        await expect(page).toHaveScreenshot(
          `home-hero-${name}-${width}x${height}.png`,
          {
            maxDiffPixelRatio: 0.05,
            fullPage: true,
          }
        );
      });

      test("should display feature cards properly", async ({ page }) => {
        // Check feature cards are visible and properly laid out
        await expect(page.locator("text=Video Frames")).toBeVisible();
        await expect(page.locator("text=Smart Cropping")).toBeVisible();
        await expect(page.locator("text=Export Ready")).toBeVisible();

        // Check cards don't overflow viewport
        await checkElementsInViewport(page);
      });

      test("should have responsive navigation", async ({ page }) => {
        // Check navigation links are accessible
        await expect(page.locator("text=About")).toBeVisible();
        await expect(page.locator("text=Privacy")).toBeVisible();
        await expect(page.locator("text=Terms")).toBeVisible();

        // Check all navigation elements are in viewport
        await checkElementsInViewport(page);
      });
    });
  });

  // Test Case 2: Editor Idle
  viewports.forEach(({ name, width, height }) => {
    test.describe(`Editor Idle - ${name} (${width}×${height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

        // Navigate to editor
        await page.click('button:has-text("Start Creating")');
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
      });

      test("should display without elements outside viewport", async ({
        page,
      }) => {
        // Wait for editor to load
        await expect(page.locator("h1")).toContainText("Snapthumb Editor");

        // Assert: no element's bounding rect exceeds viewport
        await checkElementsInViewport(page);
      });

      test("should have proper editor layout", async ({ page }) => {
        // Wait for editor to load
        await expect(page.locator("h1")).toContainText("Snapthumb Editor");

        // Take screenshot for visual regression
        await expect(page).toHaveScreenshot(
          `editor-idle-${name}-${width}x${height}.png`,
          {
            maxDiffPixelRatio: 0.05,
            fullPage: true,
          }
        );
      });
    });
  });

  // Test Case 3: Editor + Shortcuts Open
  viewports.forEach(({ name, width, height }) => {
    test.describe(`Editor + Shortcuts Open - ${name} (${width}×${height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

        // Navigate to editor
        await page.click('button:has-text("Start Creating")');
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

        // Open shortcuts overlay
        await page.click("button[aria-label='Show keyboard shortcuts']");
        await expect(page.locator("[role='dialog']")).toBeVisible();
      });

      test("should have overlay covering viewport", async ({ page }) => {
        // Assert: overlay covers viewport (95%+ coverage)
        await checkOverlayCoverage(page, "[role='dialog']");
      });

      test("should have elementFromPoint returning overlay", async ({
        page,
      }) => {
        // Assert: document.elementFromPoint(10,10) is overlay while open
        await checkElementFromPoint(page, "[role='dialog']", 10, 10);
      });

      test("should have no elements outside viewport", async ({ page }) => {
        // Assert: no element's bounding rect exceeds viewport
        await checkElementsInViewport(page);
      });

      test("should have proper z-index layering", async ({ page }) => {
        // Check z-index layering (dialog should be above header)
        await checkZIndexLayering(page, "[role='dialog']", "header");
      });

      test("should take screenshot for regression", async ({ page }) => {
        // Take screenshot with overlay open
        await expect(page).toHaveScreenshot(
          `editor-shortcuts-${name}-${width}x${height}.png`,
          {
            maxDiffPixelRatio: 0.05,
            fullPage: true,
          }
        );
      });

      test("should close properly with escape", async ({ page }) => {
        // Close overlay
        await page.keyboard.press("Escape");
        await expect(page.locator("[role='dialog']")).not.toBeVisible();

        // Verify layout is maintained after closing
        await checkElementsInViewport(page);
      });
    });
  });

  // Test Case 4: Editor + Sheet Open
  viewports.forEach(({ name, width, height }) => {
    test.describe(`Editor + Sheet Open - ${name} (${width}×${height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

        // Navigate to editor
        await page.click('button:has-text("Start Creating")');
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

        // Open a panel to trigger the bottom sheet
        await page.click('button:has-text("Upload")');
        await page.waitForTimeout(500); // Wait for sheet to open
      });

      test("should have sheet covering viewport", async ({ page }) => {
        // Check if bottom sheet is visible
        const sheet = page
          .locator('[data-state="open"]')
          .filter({ hasText: /Upload Media|Add Overlays|Export Options/ });
        if (await sheet.isVisible()) {
          // Assert: sheet covers viewport (95%+ coverage)
          await checkOverlayCoverage(page, '[data-state="open"]');
        }
      });

      test("should have elementFromPoint returning sheet", async ({ page }) => {
        // Check if bottom sheet is visible
        const sheet = page
          .locator('[data-state="open"]')
          .filter({ hasText: /Upload Media|Add Overlays|Export Options/ });
        if (await sheet.isVisible()) {
          // Assert: document.elementFromPoint(10,10) is sheet while open
          await checkElementFromPoint(page, '[data-state="open"]', 10, 10);
        }
      });

      test("should have no elements outside viewport", async ({ page }) => {
        // Assert: no element's bounding rect exceeds viewport
        await checkElementsInViewport(page);
      });

      test("should take screenshot for regression", async ({ page }) => {
        // Take screenshot with sheet open
        await expect(page).toHaveScreenshot(
          `editor-sheet-${name}-${width}x${height}.png`,
          {
            maxDiffPixelRatio: 0.05,
            fullPage: true,
          }
        );
      });

      test("should handle multiple panel switches", async ({ page }) => {
        // Test switching between different panels
        const panels = ["Upload", "Overlays", "Export"];

        for (const panel of panels) {
          await page.click(`button:has-text("${panel}")`);
          await page.waitForTimeout(300);

          // Check no elements are outside viewport during panel switches
          await checkElementsInViewport(page);
        }
      });
    });
  });

  // Comprehensive Regression Tests
  test.describe("Comprehensive Overlay Regression Tests", () => {
    test("should catch future overlay regressions across all scenarios", async ({
      page,
    }) => {
      const viewportSizes = [
        { width: 375, height: 812, name: "mobile" },
        { width: 1366, height: 768, name: "desktop" },
      ];

      for (const size of viewportSizes) {
        await page.setViewportSize({ width: size.width, height: size.height });

        // Test Home Page
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
        await checkElementsInViewport(page);

        // Test Editor Idle
        await page.click('button:has-text("Start Creating")');
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
        await checkElementsInViewport(page);

        // Test Editor + Shortcuts Open
        await page.click("button[aria-label='Show keyboard shortcuts']");
        await expect(page.locator("[role='dialog']")).toBeVisible();
        await checkOverlayCoverage(page, "[role='dialog']");
        await checkElementFromPoint(page, "[role='dialog']", 10, 10);
        await checkElementsInViewport(page);
        await checkZIndexLayering(page, "[role='dialog']", "header");

        // Close shortcuts
        await page.keyboard.press("Escape");
        await expect(page.locator("[role='dialog']")).not.toBeVisible();

        // Test Editor + Sheet Open
        await page.click('button:has-text("Upload")');
        await page.waitForTimeout(500);

        const sheet = page
          .locator('[data-state="open"]')
          .filter({ hasText: /Upload Media|Add Overlays|Export Options/ });
        if (await sheet.isVisible()) {
          await checkOverlayCoverage(page, '[data-state="open"]');
          await checkElementFromPoint(page, '[data-state="open"]', 10, 10);
        }
        await checkElementsInViewport(page);
      }
    });

    test("should verify overlay behavior with multiple test points", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
      await page.click('button:has-text("Start Creating")');
      await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

      // Open shortcuts overlay
      await page.click("button[aria-label='Show keyboard shortcuts']");
      await expect(page.locator("[role='dialog']")).toBeVisible();

      // Test multiple points to ensure overlay coverage
      const testPoints = [
        { x: 10, y: 10 },
        { x: 100, y: 100 },
        { x: 500, y: 300 },
        { x: 1000, y: 500 },
        { x: 1300, y: 700 },
      ];

      for (const point of testPoints) {
        await checkElementFromPoint(page, "[role='dialog']", point.x, point.y);
      }

      await page.keyboard.press("Escape");
    });

    test("should verify no elements exceed viewport in any state", async ({
      page,
    }) => {
      const viewportSizes = [
        { width: 375, height: 812 },
        { width: 1366, height: 768 },
      ];

      for (const size of viewportSizes) {
        await page.setViewportSize({ width: size.width, height: size.height });

        // Test all states
        const states = [
          {
            name: "Home",
            action: async () => {
              await page.goto("/");
              await page.waitForLoadState("domcontentloaded", {
                timeout: 10000,
              });
            },
          },
          {
            name: "Editor Idle",
            action: async () => {
              await page.click('button:has-text("Start Creating")');
              await page.waitForLoadState("domcontentloaded", {
                timeout: 10000,
              });
            },
          },
          {
            name: "Editor + Shortcuts",
            action: async () => {
              await page.click("button[aria-label='Show keyboard shortcuts']");
              await expect(page.locator("[role='dialog']")).toBeVisible();
            },
          },
          {
            name: "Editor + Sheet",
            action: async () => {
              await page.keyboard.press("Escape"); // Close shortcuts first
              await page.click('button:has-text("Upload")');
              await page.waitForTimeout(500);
            },
          },
        ];

        for (const state of states) {
          await state.action();
          await checkElementsInViewport(page);
        }
      }
    });
  });
});
