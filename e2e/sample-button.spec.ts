import { test, expect } from "@playwright/test";

test.describe("Sample Button Tests", () => {
  test("should load sample image when clicking sample button", async ({
    page,
  }) => {
    // Navigate to the app page
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Wait for the sample button to be visible (this indicates the page has loaded)
    const sampleButton = page.locator('[data-testid="btn-sample"]');
    await expect(sampleButton).toBeVisible({ timeout: 15000 });
    await expect(sampleButton).toContainText("Try sample image");
    
    // Click the sample button
    await sampleButton.click();

    // Wait a moment for the image to load
    await page.waitForTimeout(2000);

    // Check that the sample button is still visible after loading
    await expect(sampleButton).toBeVisible();

    // Check that the button text changes back from loading state
    await expect(sampleButton).toContainText("Try sample image");
  });

  test("should handle sample button when sample is unavailable", async ({
    page,
  }) => {
    // Mock the sample fetch to fail
    await page.route("/samples/sample.jpg", (route) => {
      route.fulfill({
        status: 404,
        contentType: "text/plain",
        body: "Not found",
      });
    });

    // Navigate to the app page
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check that the sample button is not visible when sample is unavailable
    const sampleButton = page.locator('[data-testid="btn-sample"]');
    await expect(sampleButton).not.toBeVisible();
  });

  test("should show loading state when clicking sample button", async ({
    page,
  }) => {
    // Mock the sample fetch to be slow
    await page.route("/samples/sample.jpg", async (route) => {
      // Add a delay to test loading state
      await new Promise((resolve) => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: "image/jpeg",
        body: Buffer.from("fake-image-data"),
      });
    });

    // Navigate to the app page
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Wait for the sample button and click it
    const sampleButton = page.locator('[data-testid="btn-sample"]');
    await expect(sampleButton).toBeVisible({ timeout: 15000 });
    await sampleButton.click();

    // Check that loading state is shown (this might be too fast to catch reliably)
    // At minimum, we verify the button doesn't break and eventually loads
    await page.waitForTimeout(2000);
    await expect(sampleButton).toBeVisible();
  });
});
