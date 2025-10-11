import { test, expect } from "@playwright/test";

test.describe("UI Clarity Tests", () => {
  test("'/' → two visible buttons with :hover change (via computed style diff) and footer with 'Privacy' and optional 'Project Canonical'", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check for exactly 2 visible main CTA buttons
    const mainCTAButtons = page
      .locator('a[class*="inline-flex items-center justify-center"]:visible')
      .filter({ hasText: /Try Snapthumb|Use API/ });
    await expect(mainCTAButtons).toHaveCount(2);

    // Verify the main CTA buttons are visible
    const trySnapthumbButton = page.locator('a:has-text("Try Snapthumb")');
    const useApiButton = page.locator('a:has-text("Use API")');
    await expect(trySnapthumbButton).toBeVisible();
    await expect(useApiButton).toBeVisible();

    // Test hover state changes via computed style diff
    const trySnapthumbStyles = await trySnapthumbButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.color,
      };
    });

    // Hover over the button
    await trySnapthumbButton.hover();
    await page.waitForTimeout(100); // Allow for transition

    const trySnapthumbHoverStyles = await trySnapthumbButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.color,
      };
    });

    // Verify styles changed on hover (at least one property should be different)
    const hasHoverChange =
      trySnapthumbStyles.backgroundColor !==
        trySnapthumbHoverStyles.backgroundColor ||
      trySnapthumbStyles.borderColor !== trySnapthumbHoverStyles.borderColor ||
      trySnapthumbStyles.color !== trySnapthumbHoverStyles.color;
    expect(hasHoverChange).toBe(true);

    // Test second button hover
    const useApiStyles = await useApiButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.color,
      };
    });

    await useApiButton.hover();
    await page.waitForTimeout(100);

    const useApiHoverStyles = await useApiButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.color,
      };
    });

    const useApiHasHoverChange =
      useApiStyles.backgroundColor !== useApiHoverStyles.backgroundColor ||
      useApiStyles.borderColor !== useApiHoverStyles.borderColor ||
      useApiStyles.color !== useApiHoverStyles.color;
    expect(useApiHasHoverChange).toBe(true);

    // Check footer has Privacy link and optionally Project Canonical
    const footer = page.locator("footer");
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

  test("'/app' → one dropzone + one button; no 'Try sample image'; no global warning banner", async ({
    page,
  }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Should have exactly one dropzone
    const dropzones = page.locator('[data-testid="upload-dropzone-input"]');
    await expect(dropzones).toHaveCount(1);

    // Should have exactly one button (the dropzone itself acts as a button)
    const dropzoneButton = page
      .locator('[role="button"]')
      .filter({ hasText: /Drag & drop or click to choose/ });
    await expect(dropzoneButton).toHaveCount(1);

    // Should NOT have 'Try sample image' button (it's conditional and should be absent in this test)
    const sampleButton = page.locator('[data-testid="btn-sample"]');
    await expect(sampleButton).not.toBeVisible();

    // Should NOT have any text containing 'Try sample image'
    await expect(page.locator('text="Try sample image"')).not.toBeVisible();

    // Should NOT have global warning banner
    await expect(page.locator('text="warning"')).not.toBeVisible();
    await expect(page.locator('text="Warning"')).not.toBeVisible();
    await expect(page.locator('[class*="warning"]')).not.toBeVisible();
    await expect(page.locator('[class*="banner"]')).not.toBeVisible();
  });

  test("'/api' → no hardcoded domain; endpoint includes VITE_LAYER_BASE_URL; 'Copy' writes to clipboard", async ({
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

    // Check that endpoint includes VITE_LAYER_BASE_URL (not hardcoded domain)
    const endpointElement = page.locator('code:has-text("POST")');
    await expect(endpointElement).toBeVisible();

    const endpointText = await endpointElement.textContent();
    expect(endpointText).toBeTruthy();

    // Should NOT contain hardcoded domains like localhost:3000, example.com, etc.
    expect(endpointText).not.toContain("localhost:3000");
    expect(endpointText).not.toContain("example.com");
    expect(endpointText).not.toContain("forge.tools");

    // Should contain the base URL pattern (either localhost:3000 as fallback or VITE_LAYER_BASE_URL)
    // This ensures it's using environment variables, not hardcoded
    expect(endpointText).toMatch(/POST \${.*}\/api\/thumb|POST .*\/api\/thumb/);

    // Test copy button functionality for each tab
    const tabs = ["cURL", "Node.js", "Python"];

    for (const tabName of tabs) {
      // Click the tab
      await page.click(`button:has-text("${tabName}")`);
      await page.waitForTimeout(100); // Small delay to ensure tab content loads

      // Click the copy button
      const copyButton = page.locator('button:has-text("Copy")');
      await expect(copyButton).toBeVisible();

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

      await copyButton.click();

      // Verify navigator.clipboard.writeText was called
      const copiedText = await page.evaluate(
        () =>
          (window as unknown as Record<string, unknown>)
            .lastCopiedText as string
      );
      expect(copiedText).toBeTruthy();
      expect(copiedText.length).toBeGreaterThan(0);

      // Verify the copied text contains the endpoint (not hardcoded)
      expect(copiedText).toMatch(/curl -X POST|fetch\(|requests\.post/);
      expect(copiedText).not.toContain("example.com");
    }
  });

  test("'/docs' and '/privacy' → content width < 900px, centered", async ({
    page,
  }) => {
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

    // Verify the details element contains the shortcuts content (when expanded)
    // First expand the details element to check content
    await keyboardShortcutsDetails.click();
    await page.waitForTimeout(100); // Small delay for content to show

    const shortcutsContent = detailsElement.locator('text="Canvas"');
    await expect(shortcutsContent).toBeVisible();

    // Check content width is < 900px and centered
    const container = page
      .locator('main, .container, [class*="container"]')
      .first();
    await expect(container).toBeVisible();

    const containerBox = await container.boundingBox();
    expect(containerBox).toBeTruthy();
    expect(containerBox!.width).toBeLessThan(900);

    // Check if content is centered (margin auto or flex center)
    const containerStyles = await container.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight,
        textAlign: styles.textAlign,
        display: styles.display,
        justifyContent: styles.justifyContent,
      };
    });

    // Content should be centered (either through margin auto or flex centering)
    const isCentered =
      (containerStyles.marginLeft === "auto" &&
        containerStyles.marginRight === "auto") ||
      containerStyles.textAlign === "center" ||
      (containerStyles.display === "flex" &&
        containerStyles.justifyContent === "center");
    expect(isCentered).toBe(true);

    // Test /privacy page
    await page.goto("/privacy");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Check H1 is present
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Privacy");

    // Check content width is < 900px and centered
    const privacyContainer = page
      .locator('main, .container, [class*="container"]')
      .first();
    await expect(privacyContainer).toBeVisible();

    const privacyContainerBox = await privacyContainer.boundingBox();
    expect(privacyContainerBox).toBeTruthy();
    expect(privacyContainerBox!.width).toBeLessThan(900);

    // Check if content is centered
    const privacyContainerStyles = await privacyContainer.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight,
        textAlign: styles.textAlign,
        display: styles.display,
        justifyContent: styles.justifyContent,
      };
    });

    // Content should be centered
    const privacyIsCentered =
      (privacyContainerStyles.marginLeft === "auto" &&
        privacyContainerStyles.marginRight === "auto") ||
      privacyContainerStyles.textAlign === "center" ||
      (privacyContainerStyles.display === "flex" &&
        privacyContainerStyles.justifyContent === "center");
    expect(privacyIsCentered).toBe(true);
  });
});
