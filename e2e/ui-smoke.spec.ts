import { test, expect } from "@playwright/test";

test.describe("UI Visual Sanity Tests", () => {
  test("landing page (/) has correct elements", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Wait for React to load by checking for the main content
    await page.waitForSelector("h1", { timeout: 10000 });

    // Expect exactly 1 h1 element
    const h1Elements = page.locator("h1");
    await expect(h1Elements).toHaveCount(1);
    await expect(h1Elements).toContainText("Forge Tools");

    // Expect exactly 2 buttons
    const buttons = page.locator("button");
    await expect(buttons).toHaveCount(2);

    // Verify button texts
    await expect(page.locator('button:has-text("Try Snapthumb")')).toBeVisible();
    await expect(page.locator('button:has-text("Use API")')).toBeVisible();

    // Expect footer with exactly 2 links
    const footerLinks = page.locator("footer a");
    await expect(footerLinks).toHaveCount(2);
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    await expect(page.locator('footer a[href="/docs"]')).toBeVisible();
  });

  test("app page (/app) has correct elements", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Wait for the upload interface to load
    await page.waitForSelector('[data-testid="upload-dropzone-input"]', {
      timeout: 10000,
    });

    // Wait for any toast notifications to potentially disappear
    await page.waitForTimeout(1000);

    // Expect exactly 2 main buttons (excluding toast dismiss buttons)
    const mainButtons = page.locator("button").filter({ hasNotText: /dismiss/i });
    await expect(mainButtons).toHaveCount(2);

    // Verify button texts
    await expect(page.locator('button:has-text("Choose file")')).toBeVisible();
    await expect(page.locator('button:has-text("Try sample image")')).toBeVisible();

    // Expect exactly one #dropzone element
    const dropzone = page.locator("#dropzone");
    await expect(dropzone).toHaveCount(1);
    await expect(dropzone).toBeVisible();

    // Expect formats line
    await expect(page.locator('text="PNG, JPG, WebP • MP4, WebM"')).toBeVisible();

    // Expect no global banners (no persistent banners)
    const globalBanners = page.locator('[class*="banner"]').filter({ hasNotText: /dismiss|close/i });
    await expect(globalBanners).toHaveCount(0);
  });

  test("docs page (/docs) has correct elements", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Wait for the docs content to load
    await page.waitForSelector("h1", { timeout: 10000 });

    // Expect h1 element
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Documentation");

    // Expect Quick Start section
    await expect(page.locator('h2:has-text("Quick Start")')).toBeVisible();

    // Expect details element with open=false (collapsed by default)
    const detailsElement = page.locator("details");
    await expect(detailsElement).toBeVisible();
    
    // Verify details is closed by default (open=false)
    const isOpen = await detailsElement.getAttribute("open");
    expect(isOpen).toBeNull(); // null means not open, which is the default state

    // Expect page height < 1600px
    const pageHeight = await page.evaluate(() => {
      return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
    });

    expect(pageHeight).toBeLessThan(1600);
  });
});
