import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("A11y Smoke Tests - WCAG AA Focus", () => {
  test("no color contrast violations on landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForSelector("h1", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .withRules(["color-contrast"])
      .analyze();

    // Check for color contrast violations specifically
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "color-contrast"
    );

    if (colorContrastViolations.length > 0) {
      console.error("Color contrast violations found:");
      colorContrastViolations.forEach((violation) => {
        console.error(`- ${violation.description}`);
        violation.nodes.forEach((node) => {
          console.error(`  Element: ${node.html}`);
          console.error(`  Issue: ${node.failureSummary}`);
        });
      });
    }

    expect(colorContrastViolations).toEqual([]);
  });

  test("no tap size violations on mobile viewport", async ({ page }) => {
    // Set mobile viewport to test target-size rule (44x44 minimum for WCAG AA)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await page.waitForSelector("h1", { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .withRules(["target-size"])
      .analyze();

    // Check for target size violations specifically
    const targetSizeViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "target-size"
    );

    if (targetSizeViolations.length > 0) {
      console.error("Target size violations found:");
      targetSizeViolations.forEach((violation) => {
        console.error(`- ${violation.description}`);
        violation.nodes.forEach((node) => {
          console.error(`  Element: ${node.html}`);
          console.error(`  Issue: ${node.failureSummary}`);
        });
      });
    }

    expect(targetSizeViolations).toEqual([]);
  });

  test("no color contrast violations on app page", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
    // Wait for any h1 element to be visible, or proceed after timeout
    try {
      await page.waitForSelector("h1", { timeout: 5000 });
    } catch (error) {
      console.log("No h1 found, proceeding with accessibility scan");
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .withRules(["color-contrast"])
      .analyze();

    // Check for color contrast violations specifically
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "color-contrast"
    );

    if (colorContrastViolations.length > 0) {
      console.error("Color contrast violations found:");
      colorContrastViolations.forEach((violation) => {
        console.error(`- ${violation.description}`);
        violation.nodes.forEach((node) => {
          console.error(`  Element: ${node.html}`);
          console.error(`  Issue: ${node.failureSummary}`);
        });
      });
    }

    expect(colorContrastViolations).toEqual([]);
  });

  test("no tap size violations on app page mobile viewport", async ({
    page,
  }) => {
    // Set mobile viewport to test target-size rule (44x44 minimum for WCAG AA)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
    // Wait for any h1 element to be visible, or proceed after timeout
    try {
      await page.waitForSelector("h1", { timeout: 5000 });
    } catch (error) {
      console.log("No h1 found, proceeding with accessibility scan");
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .withRules(["target-size"])
      .analyze();

    // Check for target size violations specifically
    const targetSizeViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "target-size"
    );

    if (targetSizeViolations.length > 0) {
      console.error("Target size violations found:");
      targetSizeViolations.forEach((violation) => {
        console.error(`- ${violation.description}`);
        violation.nodes.forEach((node) => {
          console.error(`  Element: ${node.html}`);
          console.error(`  Issue: ${node.failureSummary}`);
        });
      });
    }

    expect(targetSizeViolations).toEqual([]);
  });
});
