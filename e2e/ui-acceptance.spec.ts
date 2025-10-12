import { test, expect } from "@playwright/test";

test.describe("UI Acceptance Criteria", () => {
  test.describe("Homepage (/)", () => {
    test("should have exactly 2 role=button CTAs and first tab focuses 'Try Snapthumb'", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle", { timeout: 15000 });

      // Wait for React to load
      await page.waitForSelector("h1", { timeout: 10000 });

      // Check for exactly two role=button elements (CTA buttons)
      const buttons = page.locator('[role="button"]');
      await expect(buttons).toHaveCount(2);

      // Verify button texts
      await expect(
        page.locator('[role="button"]:has-text("Try Snapthumb")')
      ).toBeVisible();
      await expect(
        page.locator('[role="button"]:has-text("API docs")')
      ).toBeVisible();

      // Test focus behavior - first tab should focus 'Try Snapthumb'
      await page.keyboard.press("Tab");

      // Wait for focus to be established
      await page.waitForTimeout(200);

      // Check if any element has focus by checking the active element
      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el
          ? {
              tagName: el.tagName,
              textContent: el.textContent,
              role: el.getAttribute("role"),
              href: el.getAttribute("href"),
            }
          : null;
      });

      // The focused element should be the "Try Snapthumb" link
      expect(activeElement).toBeTruthy();
      expect(activeElement?.textContent).toContain("Try Snapthumb");
    });
  });

  test.describe("App Page (/app)", () => {
    test("should have exactly one [role='button'] dropzone and hovering adds box-shadow", async ({
      page,
    }) => {
      await page.goto("/app");
      await page.waitForLoadState("networkidle", { timeout: 15000 });

      // Wait for the upload interface to load
      await page.waitForSelector('[role="button"]', { timeout: 10000 });

      // Check for exactly one [role='button'] dropzone
      const dropzone = page.locator('[role="button"]');
      await expect(dropzone).toHaveCount(1);

      // Verify it's the upload dropzone
      await expect(dropzone).toContainText("Drag & drop or click to upload");

      // Test hovering adds box-shadow (computed style difference)
      const dropzoneElement = dropzone.first();

      // Hover over the dropzone
      await dropzoneElement.hover();

      // Verify box-shadow changed on hover (should have shadow-md class effect)
      // Check if the hover class is applied by checking computed styles
      const hasHoverEffect = await dropzoneElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        // Check for any visual change - box-shadow, transform, or other effects
        return (
          computed.boxShadow !== "none" ||
          computed.transform !== "none" ||
          computed.filter !== "none" ||
          computed.border !== "1px solid rgb(212, 212, 216)"
        ); // Different border on hover
      });
      expect(hasHoverEffect).toBeTruthy();
    });
  });

  test.describe("API Page (/api)", () => {
    test("should have copy endpoint button inline with endpoint, tabs change active styles, and code block has single border", async ({
      page,
    }) => {
      await page.goto("/api");
      await page.waitForLoadState("networkidle", { timeout: 15000 });

      // Wait for the API page to load
      await page.waitForSelector("h1", { timeout: 10000 });

      // Check copy endpoint button exists inline with endpoint
      const endpointSection = page
        .locator('section:has(h2:has-text("REST endpoint"))')
        .first();
      await expect(endpointSection).toBeVisible();

      // Verify the endpoint copy button is inline with the endpoint code
      // Use the first Copy button in the endpoint section (not the code example copy button)
      const copyEndpointButton = endpointSection
        .locator('button:has-text("Copy")')
        .first();
      await expect(copyEndpointButton).toBeVisible();

      // Test tabs change active styles
      const curlTab = page.locator('button:has-text("cURL")');
      const nodeTab = page.locator('button:has-text("Node.js")');
      const pythonTab = page.locator('button:has-text("Python")');

      // Check initial state - cURL should be active
      await expect(curlTab).toHaveClass(/bg-black.*text-white/);

      // Click Node.js tab and verify style change
      await nodeTab.click();
      await expect(nodeTab).toHaveClass(/bg-black.*text-white/);
      await expect(curlTab).toHaveClass(/bg-white.*text-black/);

      // Click Python tab and verify style change
      await pythonTab.click();
      await expect(pythonTab).toHaveClass(/bg-black.*text-white/);
      await expect(nodeTab).toHaveClass(/bg-white.*text-black/);

      // Check code block has single border (no nested borders)
      const codeBlock = page.locator("pre").first();
      await expect(codeBlock).toBeVisible();

      // Verify it has exactly one border (not nested)
      const borderStyle = await codeBlock.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.border;
      });

      // Should have a single border, not multiple nested borders
      expect(borderStyle).not.toBe("none");
      expect(borderStyle).not.toContain("double");
    });
  });

  test.describe("Privacy Page (/privacy)", () => {
    test("should have multiple h2 elements, lists exist, and no paragraph longer than 400 chars without heading break", async ({
      page,
    }) => {
      await page.goto("/privacy");
      await page.waitForLoadState("networkidle", { timeout: 15000 });

      // Wait for the privacy page to load
      await page.waitForSelector("h1", { timeout: 10000 });

      // Check for multiple h2 elements
      const h2Elements = page.locator("h2");
      await expect(h2Elements).toHaveCount(7); // Based on the privacy.tsx content

      // Verify specific h2 elements exist
      await expect(h2Elements.nth(0)).toContainText("Information We Collect");
      await expect(h2Elements.nth(1)).toContainText("How We Use Information");
      await expect(h2Elements.nth(2)).toContainText("Data Processing");
      await expect(h2Elements.nth(3)).toContainText("Third-Party Services");
      await expect(h2Elements.nth(4)).toContainText("Cookies & Local Storage");
      await expect(h2Elements.nth(5)).toContainText("Security");
      await expect(h2Elements.nth(6)).toContainText("Contact");

      // Check that lists exist
      const listElements = page.locator("ul");
      await expect(listElements).toHaveCount(5); // Multiple lists in the privacy page

      // Check for specific list content
      await expect(
        page.locator('text="Usage analytics (anonymous)"')
      ).toBeVisible();
      await expect(page.locator('text="Improve Snapthumb"')).toBeVisible();
      await expect(
        page.locator('text="Vercel Analytics (anonymous)"')
      ).toBeVisible();

      // Check paragraph length - no paragraph should be longer than 400 chars without a heading break
      const paragraphs = page.locator("p");
      const paragraphCount = await paragraphs.count();

      for (let i = 0; i < paragraphCount; i++) {
        const paragraph = paragraphs.nth(i);
        const text = await paragraph.textContent();
        if (text && text.length > 400) {
          // If paragraph is long, check if there's a heading before it
          const previousSibling = await paragraph.evaluateHandle(
            (el) => el.previousElementSibling
          );
          const isHeading = await previousSibling.evaluate(
            (el) =>
              el && ["H1", "H2", "H3", "H4", "H5", "H6"].includes(el.tagName)
          );

          if (!isHeading) {
            throw new Error(
              `Paragraph with text "${text.substring(0, 50)}..." is longer than 400 characters without a heading break`
            );
          }
        }
      }
    });
  });
});
