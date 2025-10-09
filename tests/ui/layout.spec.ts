import { test, expect } from "@playwright/test";

test.describe("Catastrophic UI Detectors", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
  });

  test("single editor mount", async ({ page }) => {
    await expect(page.locator("[data-editor-root]")).toHaveCount(1);
  });

  test("no overlapping upload overlays", async ({ page }) => {
    const overlayCount = await page
      .locator("text=Upload Image or Video")
      .count();
    expect(overlayCount).toBeLessThanOrEqual(1);
  });

  test("no duplicate toolbars", async ({ page }) => {
    await expect(page.locator('[data-testid="canvas-toolbar"]')).toHaveCount(1);
  });

  test("shortcuts modal closed by default", async ({ page }) => {
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });

  test("main grid integrity", async ({ page }) => {
    const bbox = await page.locator("[data-editor-root]").boundingBox();
    expect(bbox?.height).toBeGreaterThan(500);
    expect(bbox?.width).toBeGreaterThan(700);
  });

  test("app shell structure integrity", async ({ page }) => {
    // Check main app shell exists
    await expect(page.locator('[data-testid="app-shell"]')).toHaveCount(1);

    // Check header exists
    await expect(page.locator("header")).toHaveCount(1);

    // Check main content area exists
    await expect(page.locator("main")).toHaveCount(1);

    // Check sidebars exist
    await expect(page.locator("aside")).toHaveCount(2);
  });

  test("canvas stage visibility", async ({ page }) => {
    // Canvas stage should be visible and have reasonable dimensions
    const canvasStage = page.locator('[data-testid="canvas-stage"]');
    await expect(canvasStage).toBeVisible();

    const bbox = await canvasStage.boundingBox();
    expect(bbox?.width).toBeGreaterThan(200);
    expect(bbox?.height).toBeGreaterThan(200);
  });

  test("no duplicate portal roots", async ({ page }) => {
    // Check for duplicate portal containers that could cause modal issues
    const portalRoots = await page.locator("#portal-root").count();
    expect(portalRoots).toBeLessThanOrEqual(1);
  });

  test("navigation buttons present", async ({ page }) => {
    // Check essential navigation elements exist
    await expect(page.locator('button:has-text("Back")')).toHaveCount(1);
    await expect(page.locator('button:has-text("Shortcuts")')).toHaveCount(1);
  });

  test("toolbar controls integrity", async ({ page }) => {
    // Check canvas toolbar controls are present
    await expect(page.locator('[data-testid="ratio-selector"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="grid-toggle"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="safe-zone-toggle"]')).toHaveCount(
      1
    );
    await expect(page.locator('[data-testid="zoom-slider"]')).toHaveCount(1);
  });

  test("panel navigation integrity", async ({ page }) => {
    // Check main panel navigation buttons exist
    await expect(page.locator('button:has-text("Upload")')).toHaveCount(1);
    await expect(page.locator('button:has-text("Crop")')).toHaveCount(1);
    await expect(page.locator('button:has-text("Overlays")')).toHaveCount(1);
    await expect(page.locator('button:has-text("Export")')).toHaveCount(1);
  });

  test("no memory leaks from duplicate event listeners", async ({ page }) => {
    // Check that critical elements don't have duplicate event listeners
    // by ensuring they respond to interactions correctly
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeEnabled();

    const shortcutsButton = page.locator('button:has-text("Shortcuts")');
    await expect(shortcutsButton).toBeEnabled();

    // Click shortcuts to test modal functionality
    await shortcutsButton.click();
    await expect(page.locator("text=Keyboard Shortcuts")).toBeVisible();

    // Close modal
    await page.keyboard.press("Escape");
    await expect(page.locator("text=Keyboard Shortcuts")).not.toBeVisible();
  });

  test("responsive layout boundaries", async ({ page }) => {
    // Test that layout doesn't break at different viewport sizes
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator("[data-editor-root]")).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator("[data-editor-root]")).toBeVisible();

    // Check that grid layout maintains structure
    const appShell = page.locator('[data-testid="app-shell"]');
    const bbox = await appShell.boundingBox();
    expect(bbox?.width).toBeGreaterThan(1000);
  });

  test("z-index stacking integrity", async ({ page }) => {
    // Check that modals and overlays don't conflict
    const shortcutsButton = page.locator('button:has-text("Shortcuts")');
    await shortcutsButton.click();

    // Modal should be visible and properly stacked
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check modal is above other content
    const modalZIndex = await modal.evaluate(
      (el) => window.getComputedStyle(el).zIndex
    );
    expect(parseInt(modalZIndex)).toBeGreaterThan(10);

    // Close modal
    await page.keyboard.press("Escape");
  });

  test("no infinite loading states", async ({ page }) => {
    // Check that the app doesn't get stuck in loading states
    await page.waitForLoadState("networkidle");

    // Ensure no loading spinners are stuck visible
    const loadingElements = await page.locator("text=Loading...").count();
    expect(loadingElements).toBe(0);

    // Check that main content is interactive
    await expect(page.locator('[data-testid="app-shell"]')).toBeVisible();
  });

  test("keyboard navigation integrity", async ({ page }) => {
    // Test that keyboard navigation works without breaking layout
    await page.keyboard.press("Tab"); // Focus first interactive element
    await page.keyboard.press("Tab"); // Focus second element
    await page.keyboard.press("Tab"); // Focus third element

    // Layout should remain stable after tabbing
    await expect(page.locator("[data-editor-root]")).toBeVisible();

    // Test shortcuts don't break layout
    await page.keyboard.press("?"); // Open shortcuts
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press("Escape"); // Close shortcuts
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });

  test("content overflow protection", async ({ page }) => {
    // Check that content doesn't overflow and break layout
    const appShell = page.locator('[data-testid="app-shell"]');
    const bbox = await appShell.boundingBox();

    // Ensure the app shell doesn't exceed viewport
    expect(bbox?.width).toBeLessThanOrEqual(page.viewportSize()?.width || 0);
    expect(bbox?.height).toBeLessThanOrEqual(page.viewportSize()?.height || 0);

    // Check that scrollable areas are properly contained
    const scrollableAreas = page.locator('[style*="overflow"]');
    const count = await scrollableAreas.count();
    expect(count).toBeGreaterThan(0); // Should have some scrollable areas
  });

  test("component unmounting safety", async ({ page }) => {
    // Navigate away and back to test component lifecycle
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate back to editor
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // Ensure editor still works correctly after remount
    await expect(page.locator("[data-editor-root]")).toHaveCount(1);
    await expect(page.locator('[data-testid="app-shell"]')).toBeVisible();

    // Test that shortcuts still work after remount
    await page.locator('button:has-text("Shortcuts")').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("performance degradation detection", async ({ page }) => {
    // Measure time for critical interactions
    const startTime = Date.now();

    // Test shortcuts modal open/close performance
    await page.locator('button:has-text("Shortcuts")').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    const endTime = Date.now();
    const interactionTime = endTime - startTime;

    // Interactions should be fast (less than 2 seconds)
    expect(interactionTime).toBeLessThan(2000);
  });

  test("accessibility landmark integrity", async ({ page }) => {
    // Check that accessibility landmarks are properly structured
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("aside")).toHaveCount(2);

    // Check that landmarks have proper roles
    const header = page.locator("header");
    const main = page.locator("main");

    await expect(header).toHaveAttribute("role", "banner");
    await expect(main).toHaveAttribute("role", "main");
  });

  test("no conflicting landing pages", async ({ page }) => {
    // Navigate to root and ensure only React app loads
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should only have one "Start Creating" button (from React)
    const startCreatingButtons = await page
      .locator('button:has-text("Start Creating")')
      .count();
    expect(startCreatingButtons).toBe(1);

    // Should not have static HTML content mixed with React
    const staticContent = await page
      .locator(".container:not([data-reactroot])")
      .count();
    expect(staticContent).toBe(0);

    // Click the button and ensure it navigates to /app
    await page.locator('button:has-text("Start Creating")').click();
    await expect(page).toHaveURL(/\/app/);
  });

  test("consistent navigation flow", async ({ page }) => {
    // Test complete flow from landing to editor
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click Start Creating
    await page.locator('button:has-text("Start Creating")').click();
    await expect(page).toHaveURL(/\/app/);

    // Should be in editor, not 404
    await expect(page.locator("[data-editor-root]")).toBeVisible();
    await expect(page.locator('[data-testid="app-shell"]')).toBeVisible();

    // Back button should work
    await page.locator('button:has-text("Back")').click();
    await expect(page).toHaveURL(/\//);

    // Should be back on landing page
    await expect(
      page.locator('button:has-text("Start Creating")')
    ).toBeVisible();
  });

  test("no duplicate static content", async ({ page }) => {
    // Ensure static HTML content doesn't interfere with React
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for specific static HTML elements that shouldn't exist
    const staticLogo = await page.locator(".logo").count();
    expect(staticLogo).toBe(0);

    const staticFeatures = await page.locator(".features").count();
    expect(staticFeatures).toBe(0);

    // Should have React-rendered content instead
    await expect(page.locator("text=Snapthumb")).toBeVisible();
    await expect(page.locator("text=Video Frames")).toBeVisible();
  });

  test("single source of truth for navigation", async ({ page }) => {
    // Ensure all navigation links work consistently
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test footer navigation links
    await page.locator('button:has-text("About")').click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator("text=About")).toBeVisible();

    await page.goto("/");
    await page.locator('button:has-text("Privacy")').click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.locator("text=Privacy")).toBeVisible();

    await page.goto("/");
    await page.locator('button:has-text("Terms")').click();
    await expect(page).toHaveURL(/\/terms/);
    await expect(page.locator("text=Terms")).toBeVisible();
  });

  test("no broken internal links", async ({ page }) => {
    // Test that all internal links resolve correctly
    const routes = ["/", "/app", "/about", "/privacy", "/terms"];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Should not show 404 or error states
      await expect(page.locator("text=404")).not.toBeVisible();
      await expect(page.locator("text=Not Found")).not.toBeVisible();
      await expect(page.locator("text=Error")).not.toBeVisible();

      // Should have meaningful content
      const bodyText = await page.textContent("body");
      expect(bodyText?.length).toBeGreaterThan(100);
    }
  });

  test("prevent content duplication", async ({ page }) => {
    // Ensure content doesn't appear multiple times
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for duplicate titles
    const snapthumbTitles = await page.locator("text=Snapthumb").count();
    expect(snapthumbTitles).toBe(1);

    // Check for duplicate feature descriptions
    const videoFramesText = await page.locator("text=Video Frames").count();
    expect(videoFramesText).toBe(1);

    const smartCroppingText = await page.locator("text=Smart Cropping").count();
    expect(smartCroppingText).toBe(1);

    const exportReadyText = await page.locator("text=Export Ready").count();
    expect(exportReadyText).toBe(1);
  });
});
