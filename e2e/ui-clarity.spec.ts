import { test, expect } from "@playwright/test";

test.describe("UI Clarity Tests", () => {
  test("'/' → exactly 2 visible LinkButtons; footer has 'Privacy' and 'Project Canonical' only", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check for exactly 2 visible LinkButtons (main CTAs)
    const linkButtons = page.locator(
      'a[class*="inline-flex items-center justify-center"]:visible'
    );
    await expect(linkButtons).toHaveCount(2);

    // Verify the main CTA buttons
    await expect(page.locator('a:has-text("Try Snapthumb")')).toBeVisible();
    await expect(page.locator('a:has-text("Use API")')).toBeVisible();

    // Check footer has exactly 2 links: Privacy and Project Canonical
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    const footerLinks = footer.locator("a");
    await expect(footerLinks).toHaveCount(2);

    await expect(footer.locator('a:has-text("Privacy")')).toBeVisible();
    await expect(
      footer.locator('a:has-text("Project Canonical")')
    ).toBeVisible();
  });

  test("'/app' → one dropzone, optional sample button, no duplicate 'Choose file' button, no portal warning", async ({
    page,
  }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Should have exactly one dropzone
    const dropzones = page.locator('[id="dropzone"]');
    await expect(dropzones).toHaveCount(1);

    // Check for sample button (optional)
    const sampleButton = page.locator('[data-testid="btn-sample"]');
    const sampleButtonCount = await sampleButton.count();
    expect(sampleButtonCount).toBeLessThanOrEqual(1);

    // Should NOT have duplicate 'Choose file' buttons
    const chooseFileButtons = page.locator('text="Choose file"');
    const chooseFileCount = await chooseFileButtons.count();
    expect(chooseFileCount).toBeLessThanOrEqual(1);

    // Should NOT have portal warning
    await expect(page.locator('text="portal"')).not.toBeVisible();
    await expect(page.locator('text="Portal"')).not.toBeVisible();
    await expect(page.locator('text="warning"')).not.toBeVisible();
  });

  test("'/api' → H1 present, exactly 3 code tabs, each copy button works (navigator.clipboard called)", async ({
    page,
  }) => {
    await page.goto("/api");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check H1 is present
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("API Documentation");

    // Check for exactly 3 code tabs
    const codeTabs = page.locator(
      'button:has-text("cURL"), button:has-text("Node.js"), button:has-text("Python")'
    );
    await expect(codeTabs).toHaveCount(3);

    // Verify each tab button exists
    await expect(page.locator('button:has-text("cURL")')).toBeVisible();
    await expect(page.locator('button:has-text("Node.js")')).toBeVisible();
    await expect(page.locator('button:has-text("Python")')).toBeVisible();

    // Mock navigator.clipboard to test copy functionality
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, "clipboard", {
        value: {
          writeText: async (text: string) => {
            // Store the copied text for verification
            (window as unknown as Record<string, unknown>).lastCopiedText =
              text;
            return Promise.resolve();
          },
        },
        configurable: true,
      });
    });

    // Test copy button functionality for each tab
    const tabs = ["cURL", "Node.js", "Python"];

    for (const tabName of tabs) {
      // Click the tab
      await page.click(`button:has-text("${tabName}")`);
      await page.waitForTimeout(100); // Small delay to ensure tab content loads

      // Click the copy button
      const copyButton = page.locator('button:has-text("Copy")');
      await expect(copyButton).toBeVisible();

      await copyButton.click();

      // Verify navigator.clipboard.writeText was called
      const copiedText = await page.evaluate(
        () =>
          (window as unknown as Record<string, unknown>)
            .lastCopiedText as string
      );
      expect(copiedText).toBeTruthy();
      expect(copiedText.length).toBeGreaterThan(0);
    }
  });

  test("'/docs' → H1 present; 'Keyboard shortcuts' details element exists and is collapsed by default", async ({
    page,
  }) => {
    await page.goto("/docs");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check H1 is present
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Snapthumb Help");

    // Check for 'Keyboard shortcuts' details element
    const keyboardShortcutsDetails = page.locator(
      'details summary:has-text("Keyboard shortcuts")'
    );
    await expect(keyboardShortcutsDetails).toBeVisible();

    // Verify the details element is collapsed by default (open attribute should not be present)
    const detailsElement = keyboardShortcutsDetails.locator("..");
    const isOpen = await detailsElement.getAttribute("open");
    expect(isOpen).toBeNull(); // Should be collapsed by default

    // Verify the details element contains the shortcuts content
    const shortcutsContent = detailsElement.locator('text="Canvas"');
    await expect(shortcutsContent).toBeVisible();
  });
});
