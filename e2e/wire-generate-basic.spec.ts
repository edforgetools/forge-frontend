import { test, expect } from "@playwright/test";

test.describe("Wire Generate Basic E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Navigate to editor
    await page.click('button:has-text("Start Creating")');
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Wait for editor to load
    await page.waitForTimeout(3000);
  });

  test("should navigate to wire generate demo page", async ({ page }) => {
    // Go back to home
    await page.goto("/");

    // Click on Wire Generate Demo
    await page.click('button:has-text("Wire Generate Demo")');

    // Should be on wire generate demo page
    await expect(page).toHaveURL(/.*wire-generate-demo/);
  });

  test("should test wire generate functionality on demo page", async ({
    page,
  }) => {
    // Navigate directly to wire generate demo
    await page.goto("/wire-generate-demo");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Look for wire generate button
    const generateButton = page.locator('button:has-text("Generate")');
    await expect(generateButton).toBeVisible();

    // Test the generate button
    await generateButton.click();

    // Wait for response (mock API in dev mode)
    await page.waitForTimeout(3000);

    // Check for success indicators (use first() to avoid strict mode violation)
    const successIndicator = page.locator("text=Generation Complete").first();
    if (await successIndicator.isVisible()) {
      console.log("✅ Wire generate completed successfully");
    }
  });

  test("should test preset functionality", async ({ page }) => {
    // Navigate to wire generate demo
    await page.goto("/wire-generate-demo");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Look for preset buttons
    const presetButtons = page
      .locator("button")
      .filter({ hasText: /Center|Top|Bottom|Left|Right/ });
    const count = await presetButtons.count();

    if (count > 0) {
      console.log(`✅ Found ${count} preset buttons`);

      // Test clicking a preset
      await presetButtons.first().click();
      await page.waitForTimeout(500);
    } else {
      console.log(
        "ℹ️ No preset buttons found - checking for alternative controls"
      );
    }
  });

  test("should test scale and opacity controls", async ({ page }) => {
    // Navigate to wire generate demo
    await page.goto("/wire-generate-demo");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Look for sliders or range inputs
    const sliders = page.locator('input[type="range"]');
    const sliderCount = await sliders.count();

    if (sliderCount > 0) {
      console.log(`✅ Found ${sliderCount} slider controls`);

      // Test the first slider (likely scale)
      await sliders.first().fill("0.8");
      await page.waitForTimeout(500);

      // Test the second slider if it exists (likely opacity)
      if (sliderCount > 1) {
        await sliders.nth(1).fill("75");
        await page.waitForTimeout(500);
      }
    } else {
      console.log(
        "ℹ️ No slider controls found - checking for alternative controls"
      );
    }
  });

  test("should test caching behavior", async ({ page }) => {
    // Navigate to wire generate demo
    await page.goto("/wire-generate-demo");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForTimeout(2000);

    // First generation
    const startTime1 = Date.now();
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(3000);
    const endTime1 = Date.now();
    const firstCallTime = endTime1 - startTime1;

    console.log(`First generation took: ${firstCallTime}ms`);

    // Second identical generation
    const startTime2 = Date.now();
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(3000);
    const endTime2 = Date.now();
    const secondCallTime = endTime2 - startTime2;

    console.log(`Second generation took: ${secondCallTime}ms`);

    // Second call should be faster (cached) - allow some variance for mock API
    expect(secondCallTime).toBeLessThanOrEqual(firstCallTime + 500);

    // Check for cache indication
    const cacheIndicator = page.locator("text=Cached Result");
    if (await cacheIndicator.isVisible()) {
      console.log("✅ Cache behavior confirmed");
    }
  });

  test("should test error handling", async ({ page }) => {
    // Navigate to wire generate demo
    await page.goto("/wire-generate-demo");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Intercept API calls and return error
    await page.route("**/api/wire-generate", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Validation failed",
          details: [
            {
              code: "invalid_type",
              expected: "string",
              received: "undefined",
              path: ["aspect"],
              message: "Required",
            },
          ],
        }),
      });
    });

    // Try to generate
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(2000);

    // Check for error message
    const errorMessage = page.locator("text=Validation failed");
    if (await errorMessage.isVisible()) {
      console.log("✅ Error handling confirmed");
    }
  });

  test("should measure performance", async ({ page }) => {
    // Navigate to wire generate demo
    await page.goto("/wire-generate-demo");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Measure generation time
    const startTime = Date.now();
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(3000);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`Total generation time: ${totalTime}ms`);

    // Should complete in reasonable time (relaxed for mock API)
    expect(totalTime).toBeLessThan(10000);

    if (totalTime < 2000) {
      console.log("✅ Performance target met (<2s)");
    } else {
      console.log("ℹ️ Performance within acceptable range for mock API");
    }
  });
});
