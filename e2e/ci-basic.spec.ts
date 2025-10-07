import { test, expect } from "@playwright/test";

test.describe("CI Basic Smoke Tests", () => {
  test("should load the landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Debug: Log page content and check for errors
    console.log("Page title:", await page.title());
    console.log("Page URL:", page.url());
    
    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Check main elements are present
    await expect(page.locator("h1")).toContainText("Snapthumb");
    
    // Debug: Check what buttons are actually on the page
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on the page`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`Button ${i}: "${text}"`);
    }
    
    await expect(page.locator('button:has-text("Start Creating")')).toBeVisible(
      { timeout: 10000 }
    );
  });

  test("should navigate to app page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Wait for and click start button
    await page.waitForSelector('button:has-text("Start Creating")', {
      timeout: 10000,
    });
    await page.click('button:has-text("Start Creating")');
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Check app page loaded
    await expect(page.locator("h1")).toContainText("Snapthumb Editor");
    await expect(
      page.getByRole("button", {
        name: "Upload panel - Upload images or videos",
      })
    ).toBeVisible();
  });
});
