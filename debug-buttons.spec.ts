import { test, expect } from "@playwright/test";

test("debug buttons on app page", async ({ page }) => {
  await page.goto("/app");
  await page.waitForLoadState("networkidle", { timeout: 15000 });

  // Wait for the upload interface to load
  await page.waitForSelector('[data-testid="upload-dropzone-input"]', {
    timeout: 10000,
  });

  // Get all buttons and log their details
  const buttons = page.locator("button");
  const buttonCount = await buttons.count();
  console.log(`Found ${buttonCount} buttons:`);

  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i);
    const text = await button.textContent();
    const id = await button.getAttribute("id");
    const className = await button.getAttribute("class");
    console.log(
      `Button ${i + 1}: text="${text}", id="${id}", class="${className}"`
    );
  }

  // Also check for any elements with button-like classes
  const buttonLikeElements = page.locator('[class*="btn"], [role="button"]');
  const buttonLikeCount = await buttonLikeElements.count();
  console.log(`Found ${buttonLikeCount} button-like elements:`);

  for (let i = 0; i < buttonLikeCount; i++) {
    const element = buttonLikeElements.nth(i);
    const tagName = await element.evaluate((el) => el.tagName);
    const text = await element.textContent();
    const className = await element.getAttribute("class");
    console.log(
      `Button-like ${i + 1}: <${tagName}> text="${text}", class="${className}"`
    );
  }
});
