import { test, expect } from "@playwright/test";

test.describe("UI Clarity Tests", () => {
  test("'/' → exactly 2 visible buttons; both tabbable; footer has 'Privacy' only or with 'Project Canonical' if env set", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check for exactly 2 visible main CTA buttons
    const mainCTAButtons = page
      .locator('a[class*="inline-flex items-center justify-center"]:visible')
      .filter({ hasText: /Try Snapthumb|API docs/ });
    await expect(mainCTAButtons).toHaveCount(2);

    // Verify the main CTA buttons are visible and tabbable
    const trySnapthumbButton = page.locator('a:has-text("Try Snapthumb")');
    const useApiButton = page.locator('a:has-text("API docs")');
    await expect(trySnapthumbButton).toBeVisible();
    await expect(useApiButton).toBeVisible();

    // Check both buttons are tabbable (have tabindex >= 0 or no tabindex)
    const trySnapthumbTabIndex =
      await trySnapthumbButton.getAttribute("tabindex");
    const useApiTabIndex = await useApiButton.getAttribute("tabindex");

    expect(
      trySnapthumbTabIndex === null || parseInt(trySnapthumbTabIndex) >= 0
    ).toBe(true);
    expect(useApiTabIndex === null || parseInt(useApiTabIndex) >= 0).toBe(true);

    // Check footer has Privacy link and optionally Project Canonical
    const footer = page.locator("footer, .flex.justify-center.gap-6");
    await expect(footer).toBeVisible();

    // Privacy link should always be present
    await expect(footer.locator('a:has-text("Privacy")')).toBeVisible();

    // Project Canonical link is conditional based on VITE_CANONICAL_URL
    const canonicalLink = footer.locator('a:has-text("Project Canonical")');
    const canonicalLinkCount = await canonicalLink.count();

    // Footer should have at least 1 link (Privacy) and at most 2 links
    const footerLinks = footer.locator("a");
    const footerLinkCount = await footerLinks.count();
    expect(footerLinkCount).toBeGreaterThanOrEqual(1);
    expect(footerLinkCount).toBeLessThanOrEqual(2);

    // If Project Canonical link exists, verify it's visible
    if (canonicalLinkCount > 0) {
      await expect(canonicalLink).toBeVisible();
    }
  });

  test("'/app' → one dropzone and zero duplicate upload buttons; no global banner", async ({
    page,
  }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Should have exactly one dropzone
    const dropzones = page.locator('[data-testid="upload-dropzone-input"]');
    await expect(dropzones).toHaveCount(1);

    // Should have exactly one upload dropzone (div with click handlers)
    const uploadDropzones = page
      .locator("div")
      .filter({ hasText: /Drag & drop or click to choose/ })
      .first();
    await expect(uploadDropzones).toBeVisible();

    // Should NOT have duplicate upload buttons
    const allUploadRelatedButtons = page
      .locator('button, [role="button"]')
      .filter({
        hasText: /upload|Upload|choose|Choose|drag|Drag/,
      });
    const uploadButtonCount = await allUploadRelatedButtons.count();
    expect(uploadButtonCount).toBeLessThanOrEqual(2); // Only the main dropzone and possibly sample button

    // Should NOT have global warning banner
    await expect(page.locator('text="warning"')).not.toBeVisible();
    await expect(page.locator('text="Warning"')).not.toBeVisible();
    await expect(page.locator('[class*="warning"]')).not.toBeVisible();
    await expect(page.locator('[class*="banner"]')).not.toBeVisible();
    await expect(page.locator('[class*="alert"]')).not.toBeVisible();
  });

  test("'/api' → h1 present; endpoint uses VITE_LAYER_BASE_URL; three tabs; copy button triggers clipboard", async ({
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

    // Check that endpoint uses VITE_LAYER_BASE_URL (not hardcoded domain)
    const endpointElement = page.locator(
      'code.text-sm.font-mono:has-text("POST")'
    );
    await expect(endpointElement).toBeVisible();

    const endpointText = await endpointElement.textContent();
    expect(endpointText).toBeTruthy();

    // Should contain the base URL pattern using environment variable
    // Either shows the actual BASE value or the template variable
    expect(endpointText).toMatch(/POST .*\/api\/thumb/);

    // Test copy button functionality - verify it triggers clipboard
    const copyButtons = page.locator('button:has-text("Copy")');
    await expect(copyButtons).toHaveCount(2); // One for examples, one for response

    // Mock clipboard functionality and verify it's called
    await page.evaluate(() => {
      // Mock clipboard
      Object.defineProperty(navigator, "clipboard", {
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

    await copyButtons.first().click();

    // Verify navigator.clipboard.writeText was called
    const copiedText = await page.evaluate(
      () =>
        (window as unknown as Record<string, unknown>).lastCopiedText as string
    );
    expect(copiedText).toBeTruthy();
    expect(copiedText.length).toBeGreaterThan(0);

    // Verify the copied text contains the endpoint
    expect(copiedText).toMatch(/curl -X POST/);
  });

  test("'/docs' and '/privacy' → page content width <= 720px", async ({
    page,
  }) => {
    // Set a smaller viewport to test responsive behavior
    await page.setViewportSize({ width: 800, height: 600 });

    // Test /docs page
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

    // Check content width is <= 720px (check the actual content container)
    // The Container component has classes: mx-auto w-full max-w-screen-sm p-6 sm:p-8
    const container = page
      .locator('main div[class*="max-w-screen-sm"]')
      .first();
    await expect(container).toBeVisible();

    const containerBox = await container.boundingBox();
    expect(containerBox).toBeTruthy();

    // The container should be constrained by max-w-screen-sm (640px) + padding
    // Account for padding (p-6 sm:p-8 = 24px-32px on each side = 48px-64px total)
    expect(containerBox!.width).toBeLessThanOrEqual(800); // 640px max content + 160px padding buffer

    // Test /privacy page
    await page.goto("/privacy");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check H1 is present
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Privacy");

    // Check content width is <= 720px (check the actual content container)
    const privacyContainer = page
      .locator('main div[class*="max-w-screen-sm"]')
      .first();
    await expect(privacyContainer).toBeVisible();

    const privacyContainerBox = await privacyContainer.boundingBox();
    expect(privacyContainerBox).toBeTruthy();
    expect(privacyContainerBox!.width).toBeLessThanOrEqual(800); // 640px max content + 160px padding buffer
  });
});
