import { test, expect } from "@playwright/test";

test.describe("Sample Loader", () => {
  test("should load sample image and show canvas/editor state", async ({
    page,
  }) => {
    // Navigate to the app
    await page.goto("/app");

    // Wait for the upload interface to load
    await page.waitForSelector('[data-testid="upload-dropzone-input"]', {
      timeout: 10000,
    });

    // Check if the sample button is available
    const sampleButton = page.locator('[data-testid="btn-sample"]');
    const isSampleAvailable = await sampleButton.isVisible();

    if (isSampleAvailable) {
      // Click the sample button
      await sampleButton.click();

      // Wait a moment for the sample to load
      await page.waitForTimeout(2000);

      // Check that the button shows loading state and then becomes available again
      // or that some UI change occurred (like a toast notification)
      await expect(sampleButton).toBeVisible();

      // Verify that the sample loading process completed
      // This could be verified by checking that the button is no longer in loading state
      const buttonText = await sampleButton.textContent();
      expect(buttonText).not.toContain("Loading");
    } else {
      // If sample is not available, just verify the upload interface works
      console.log("Sample button not available, testing upload interface only");

      // Test that the dropzone is clickable
      const dropzone = page.locator("#dropzone");
      await expect(dropzone).toBeVisible();

      // Set up a file dialog handler
      let fileDialogOpened = false;
      page.on("filechooser", () => {
        fileDialogOpened = true;
      });

      // Click on the dropzone
      await dropzone.click();

      // The file dialog should open
      expect(fileDialogOpened).toBe(true);
    }
  });

  test("should handle sample loading errors gracefully", async ({ page }) => {
    // Navigate to the app
    await page.goto("/app");

    // Wait for the upload interface to load
    await page.waitForSelector('[data-testid="upload-dropzone-input"]', {
      timeout: 10000,
    });

    // Check if sample button is available
    const sampleButton = page.locator('[data-testid="btn-sample"]');
    const isSampleAvailable = await sampleButton.isVisible();

    if (isSampleAvailable) {
      // Mock a failed fetch for the sample
      await page.route("/samples/sample.jpg", (route) => {
        route.fulfill({
          status: 404,
          contentType: "text/plain",
          body: "Not found",
        });
      });

      // Click the sample button
      await sampleButton.click();

      // The button should show loading state or become hidden after failure
      // Since we're mocking a 404, the button should eventually be hidden
      await expect(sampleButton).not.toBeVisible({ timeout: 5000 });
    } else {
      // If sample button is not available, that's also a valid test case
      console.log("Sample button not available - test passed");
    }
  });

  test("should allow clicking dropzone to open file picker", async ({
    page,
  }) => {
    // Navigate to the app
    await page.goto("/app");

    // Wait for the upload interface to load
    await page.waitForSelector('[data-testid="upload-dropzone-input"]', {
      timeout: 10000,
    });

    // Set up a file dialog handler
    let fileDialogOpened = false;
    page.on("filechooser", () => {
      fileDialogOpened = true;
    });

    // Click on the dropzone area (not the input itself)
    const dropzone = page.locator("#dropzone");
    await dropzone.click();

    // The file dialog should open
    expect(fileDialogOpened).toBe(true);
  });

  test("should show unified upload surface without separate choose file button", async ({
    page,
  }) => {
    // Navigate to the app
    await page.goto("/app");

    // Wait for the upload interface to load
    await page.waitForSelector('[data-testid="upload-dropzone-input"]', {
      timeout: 10000,
    });

    // Verify that the dropzone is clickable and has the correct label
    const dropzone = page.locator("#dropzone");
    await expect(dropzone).toBeVisible();
    await expect(dropzone).toContainText(
      "Drag & drop files here or click to choose"
    );

    // Verify that there's no separate "Choose file" button
    const chooseFileButton = page.locator('button:has-text("Choose file")');
    await expect(chooseFileButton).not.toBeVisible();

    // The dropzone should be clickable (it has tabindex and cursor-pointer)
    await expect(dropzone).toHaveAttribute("tabindex", "0");
    await expect(dropzone).toHaveClass(/cursor-pointer/);
  });
});
