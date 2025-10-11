import { test, expect } from "@playwright/test";

test.describe("UI Clarity and CTA Tests", () => {
  test("'/' landing page has exactly 2 visible buttons, both tabbable", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Find all visible buttons on the landing page
    const buttons = page.locator("button:visible");
    const buttonCount = await buttons.count();

    // Should have exactly 2 visible buttons
    expect(buttonCount).toBe(2);

    // Check that both buttons are tabbable (have tabindex >= 0)
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const tabIndex = await button.getAttribute("tabindex");
      const isTabbable = tabIndex === null || parseInt(tabIndex) >= 0;
      expect(isTabbable).toBe(true);
    }

    // Verify the expected button texts
    await expect(
      page.locator('button:has-text("Try Snapthumb")')
    ).toBeVisible();
    await expect(page.locator('button:has-text("Use API")')).toBeVisible();
  });

  test("'/app' shows one dropzone and at most 1 upload button (sample optional)", async ({
    page,
  }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Wait for the editor layout to load
    await expect(page.locator('[data-testid="editor-layout"]')).toBeVisible();

    // Should have exactly one dropzone
    const dropzones = page.locator('[data-testid="upload-dropzone-input"]');
    await expect(dropzones).toHaveCount(1);

    // Check for upload buttons - should have at most 1
    const uploadButtons = page.locator(
      'button:has-text("Try sample image"), button:has-text("Loading...")'
    );
    const uploadButtonCount = await uploadButtons.count();
    expect(uploadButtonCount).toBeLessThanOrEqual(1);

    // If sample button exists, verify it's properly configured
    if (uploadButtonCount === 1) {
      await expect(page.locator('[data-testid="btn-sample"]')).toBeVisible();
    }

    // Verify the dropzone is accessible
    const dropzone = page.locator(
      '[role="button"][aria-label*="Drag and drop"]'
    );
    await expect(dropzone).toBeVisible();
    await expect(dropzone).toHaveAttribute("tabindex", "0");
  });

  test("'/api' shows code blocks and no 'Back' text posing as a button", async ({
    page,
  }) => {
    await page.goto("/api");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Should have code blocks
    await expect(page.locator("pre code")).toBeVisible();
    const codeBlocks = page.locator("code");
    const codeCount = await codeBlocks.count();
    expect(codeCount).toBeGreaterThanOrEqual(3); // At least curl, JS, Python examples

    // Should NOT have any "Back" text that looks like a button
    const backElements = page.locator('text="Back"');
    const backCount = await backElements.count();

    if (backCount > 0) {
      // If there are "Back" elements, verify they are NOT styled as buttons
      for (let i = 0; i < backCount; i++) {
        const element = backElements.nth(i);
        const tagName = await element.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        expect(tagName).not.toBe("button");

        // Check if it has button-like styling (should not)
        const classes = await element.getAttribute("class");
        if (classes) {
          expect(classes).not.toContain("btn");
          expect(classes).not.toContain("button");
        }
      }
    }

    // Verify code blocks have copy functionality
    const copyButtons = page.locator(
      'button:has-text("Copy"), button:has-text("Copied!")'
    );
    const copyButtonCount = await copyButtons.count();
    expect(copyButtonCount).toBeGreaterThanOrEqual(3); // At least curl, JS, Python copy buttons
  });

  test("'/docs' lists Quick Start, Supported Formats, Limits", async ({
    page,
  }) => {
    await page.goto("/docs");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check for required sections
    await expect(page.locator("text=Quick Start")).toBeVisible();
    await expect(page.locator("text=Supported Formats")).toBeVisible();
    await expect(page.locator("text=Limits")).toBeVisible();

    // Verify Quick Start has steps
    await expect(page.locator("text=Upload image or video")).toBeVisible();
    await expect(page.locator("text=Pick frame (if video)")).toBeVisible();
    await expect(page.locator("text=Add logo overlay")).toBeVisible();
    await expect(page.locator("text=Adjust position and size")).toBeVisible();
    await expect(page.locator("text=Export thumbnail")).toBeVisible();

    // Verify Supported Formats content
    await expect(
      page.locator("text=Input: MP4, WebM, JPG, PNG, WebP")
    ).toBeVisible();
    await expect(page.locator("text=Output: JPG, PNG, WebP")).toBeVisible();

    // Verify Limits content
    await expect(page.locator("text=Free: 10 gens/day")).toBeVisible();
    await expect(page.locator("text=Export: optimized ≤ 2 MB")).toBeVisible();

    // Verify keyboard shortcuts section exists
    await expect(page.locator("text=Keyboard shortcuts")).toBeVisible();
  });

  test("Navigation between pages maintains UI clarity", async ({ page }) => {
    // Start at landing page
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Navigate to app
    await page.click('button:has-text("Try Snapthumb")');
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForURL("**/app", { timeout: 10000 });

    // Verify app page loaded correctly
    await expect(page.locator('[data-testid="editor-layout"]')).toBeVisible();

    // Navigate back using the Back button
    await page.click('button:has-text("Back")');
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForURL("**/", { timeout: 10000 });

    // Navigate to API
    await page.click('button:has-text("Use API")');
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForURL("**/api", { timeout: 10000 });

    // Verify API page loaded correctly
    await expect(page.locator("text=API Documentation")).toBeVisible();
    await expect(page.locator("pre code")).toBeVisible();
  });

  test("All pages have proper heading structure", async ({ page }) => {
    const pages = ["/", "/app", "/api", "/docs"];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

      // Each page should have exactly one h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      // Verify h1 is visible and has content
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();

      const h1Text = await h1.textContent();
      expect(h1Text).toBeTruthy();
      expect(h1Text!.trim().length).toBeGreaterThan(0);
    }
  });

  test("Accessibility: All interactive elements are keyboard navigable", async ({
    page,
  }) => {
    const pages = ["/", "/app", "/api", "/docs"];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

      // Get all interactive elements
      const interactiveElements = page.locator(
        "button, [role='button'], a, input, select, textarea, [tabindex='0'], [tabindex='1']"
      );

      const count = await interactiveElements.count();

      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i);

        // Skip hidden elements
        if (!(await element.isVisible())) continue;

        // Check if element is focusable
        const isFocusable = await element.evaluate((el) => {
          const tabIndex = el.getAttribute("tabindex");
          const tagName = el.tagName.toLowerCase();

          // Elements that are naturally focusable
          if (
            ["button", "a", "input", "select", "textarea"].includes(tagName)
          ) {
            return true;
          }

          // Elements with explicit tabindex
          if (tabIndex !== null) {
            return parseInt(tabIndex) >= 0;
          }

          return false;
        });

        expect(isFocusable).toBe(true);
      }
    }
  });
});
