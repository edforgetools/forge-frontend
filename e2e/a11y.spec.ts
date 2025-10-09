import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("should not have accessibility violations on landing page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    // Wait for the actual content to load (H1 heading)
    await page.waitForSelector("h1", { timeout: 10000 });
    // Wait for the actual content to load (H1 heading)
    await page.waitForSelector("h1", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .withRules([
        "color-contrast",
        "target-size",
        "button-name",
        "image-alt",
        "label",
        "link-name",
        "list",
        "listitem",
        "heading-order",
        "html-has-lang",
        "page-has-heading-one",
        "region",
        "skip-link",
        "tabindex",
        "valid-lang",
      ])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should not have accessibility violations on app page", async ({
    page,
  }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    // Wait for the actual content to load (H1 heading)
    await page.waitForSelector("h1", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .withRules([
        "color-contrast",
        "target-size",
        "button-name",
        "image-alt",
        "label",
        "link-name",
        "list",
        "listitem",
        "heading-order",
        "html-has-lang",
        "page-has-heading-one",
        "region",
        "skip-link",
        "tabindex",
        "valid-lang",
      ])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should not have accessibility violations on mobile viewport", async ({
    page,
  }) => {
    // Set mobile viewport to test target-size rule
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    // Wait for the actual content to load (H1 heading)
    await page.waitForSelector("h1", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .withRules([
        "color-contrast",
        "target-size",
        "button-name",
        "image-alt",
        "label",
        "link-name",
        "list",
        "listitem",
        "heading-order",
        "html-has-lang",
        "page-has-heading-one",
        "region",
        "skip-link",
        "tabindex",
        "valid-lang",
      ])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should not have accessibility violations on app page mobile viewport", async ({
    page,
  }) => {
    // Set mobile viewport to test target-size rule
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .withRules([
        "color-contrast",
        "target-size",
        "button-name",
        "image-alt",
        "label",
        "link-name",
        "list",
        "listitem",
        "heading-order",
        "html-has-lang",
        "page-has-heading-one",
        "region",
        "skip-link",
        "tabindex",
        "valid-lang",
      ])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have proper color contrast on all text elements", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    // Wait for the actual content to load (H1 heading)
    await page.waitForSelector("h1", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    // Filter only color-contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "color-contrast"
    );

    if (colorContrastViolations.length > 0) {
      console.log("Color contrast violations found:");
      colorContrastViolations.forEach((violation) => {
        console.log(`- ${violation.description}`);
        violation.nodes.forEach((node) => {
          console.log(`  Element: ${node.html}`);
          console.log(`  Issue: ${node.failureSummary}`);
        });
      });
    }

    expect(colorContrastViolations).toEqual([]);
  });

  test("should have properly sized interactive elements on mobile", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    // Wait for the actual content to load (H1 heading)
    await page.waitForSelector("h1", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["target-size"])
      .analyze();

    // Filter only target-size violations
    const targetSizeViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "target-size"
    );

    if (targetSizeViolations.length > 0) {
      console.log("Target size violations found:");
      targetSizeViolations.forEach((violation) => {
        console.log(`- ${violation.description}`);
        violation.nodes.forEach((node) => {
          console.log(`  Element: ${node.html}`);
          console.log(`  Issue: ${node.failureSummary}`);
        });
      });
    }

    expect(targetSizeViolations).toEqual([]);
  });
});
