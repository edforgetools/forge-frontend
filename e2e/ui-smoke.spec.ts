import { test, expect } from "@playwright/test";

test.describe("UI Smoke Tests", () => {
  test("should load home page with proper structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check main heading
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Create Perfect Thumbnails");

    // Check header navigation
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator('nav a:has-text("Home")')).toBeVisible();
    await expect(page.locator('nav a:has-text("App")')).toBeVisible();
    await expect(page.locator('nav a:has-text("API")')).toBeVisible();

    // Check CTA buttons
    await expect(page.locator('a:has-text("Launch Snapthumb")')).toBeVisible();
    await expect(page.locator('a:has-text("API docs")')).toBeVisible();

    // Check feature cards
    await expect(
      page.locator("h3:has-text('Quick Positioning')")
    ).toBeVisible();
    await expect(page.locator("h3:has-text('Live Preview')")).toBeVisible();
    await expect(page.locator("h3:has-text('Export Ready')")).toBeVisible();
  });

  test("should have proper header navigation with active states", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check active state on home page
    const homeLink = page.locator('nav a[href="/"]');
    await expect(homeLink).toHaveAttribute("aria-current", "page");

    // Navigate to app page and check active state
    await page.click('nav a:has-text("App")');
    await page.waitForLoadState("domcontentloaded");
    await page.waitForURL("**/app");

    const appLink = page.locator('nav a[href="/app"]');
    await expect(appLink).toHaveAttribute("aria-current", "page");
  });

  test("should have proper API base URL rendered", async ({ page }) => {
    await page.goto("/api");
    await page.waitForLoadState("domcontentloaded");

    // Check that API base URL is displayed
    const apiEndpoint = page.locator("code").first();
    await expect(apiEndpoint).toBeVisible();
    await expect(apiEndpoint).toContainText("POST");
    await expect(apiEndpoint).toContainText("/api/thumb");
  });

  test("should have dynamic footer year", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const currentYear = new Date().getFullYear().toString();
    const footer = page.locator("footer");
    await expect(footer).toContainText(`© ${currentYear} Forge`);
  });

  test("should have proper minimum touch targets", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check header nav links have proper size
    const navLinks = page.locator("nav a");
    const linkCount = await navLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const box = await link.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("should have proper content width", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check container max-width
    const container = page.locator(".container, [class*='max-w-']").first();
    const containerBox = await container.boundingBox();
    const viewport = page.viewportSize();

    if (containerBox && viewport) {
      // Should not exceed 720px + gutters
      expect(containerBox.width).toBeLessThanOrEqual(720 + 48); // 720px + 24px gutters on each side
    }
  });
});
