import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("should load pricing page with all tiers", async ({ page }) => {
    // Check page title and main heading
    await expect(page.locator("h1")).toContainText(
      "Simple, transparent pricing"
    );

    // Check all three pricing tiers are present
    await expect(page.locator('[class*="grid-cols"] h3')).toHaveCount(3);
    await expect(page.locator('[class*="grid-cols"] h3').nth(0)).toContainText(
      "Free"
    );
    await expect(page.locator('[class*="grid-cols"] h3').nth(1)).toContainText(
      "Pro"
    );
    await expect(page.locator('[class*="grid-cols"] h3').nth(2)).toContainText(
      "Team"
    );
  });

  test("should display pricing information correctly", async ({ page }) => {
    // Check pricing amounts
    await expect(page.locator("text=$0")).toBeVisible();
    await expect(page.locator("text=$9")).toBeVisible();
    await expect(page.locator("text=$39")).toBeVisible();

    // Check popular badge on Pro tier
    await expect(page.locator("text=Most Popular")).toBeVisible();
  });

  test("should have FAQ section", async ({ page }) => {
    await expect(page.locator("h2")).toContainText(
      "Frequently Asked Questions"
    );

    // Check FAQ items are present
    const faqItems = page.locator("[class*='space-y-4'] > div").filter({
      hasText:
        /How does billing work|What happens if I exceed|Can I cancel anytime|Do you offer refunds|Is my data secure/,
    });
    await expect(faqItems).toHaveCount(5);

    // Check specific FAQ questions
    await expect(page.locator("text=How does billing work?")).toBeVisible();
    await expect(
      page.locator("text=What happens if I exceed my limits?")
    ).toBeVisible();
    await expect(page.locator("text=Can I cancel anytime?")).toBeVisible();
  });

  test("should have working checkout buttons", async ({ page }) => {
    // Check that checkout buttons are present and clickable
    const checkoutButtons = page
      .locator("button")
      .filter({ hasText: /Start|Get Started/ });
    await expect(checkoutButtons).toHaveCount(3);

    // Test Free tier button
    const freeButton = checkoutButtons.nth(0);
    await expect(freeButton).toContainText("Get Started");

    // Test Pro tier button
    const proButton = checkoutButtons.nth(1);
    await expect(proButton).toContainText("Start Pro Trial");

    // Test Team tier button
    const teamButton = checkoutButtons.nth(2);
    await expect(teamButton).toContainText("Start Team Trial");
  });

  test("should redirect to Stripe domain stub on checkout", async ({
    page,
  }) => {
    // Mock the checkout API response
    await page.route("**/billing/checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "https://checkout.stripe.com/c/pay/test_session_123",
        }),
      });
    });

    // Click the Pro tier checkout button
    const proButton = page
      .locator("button")
      .filter({ hasText: "Start Pro Trial" });
    await proButton.click();

    // Verify redirect to Stripe domain
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
  });

  test("should have proper navigation links", async ({ page }) => {
    // Check privacy and terms links in footer
    await expect(page.locator("footer a[href='/privacy']")).toBeVisible();
    await expect(page.locator("footer a[href='/terms']")).toBeVisible();
  });

  test("should be accessible", async ({ page }) => {
    // Check for proper heading structure
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h2")).toBeVisible();
    await expect(page.locator('[class*="grid-cols"] h3')).toHaveCount(3);

    // Check for proper button accessibility
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      await expect(buttons.nth(i)).toHaveAttribute("type");
    }
  });
});

test.describe("Pricing Success Page", () => {
  test("should handle success flow with mock session", async ({ page }) => {
    // Mock the API response for successful checkout
    await page.route("**/billing/key?session_id=*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          key: "forge_test_key_12345678901234567890",
          plan: "Pro",
        }),
      });
    });

    await page.goto("/pricing/success?session_id=test_session_123");

    // Check success page elements
    await expect(page.locator("h1")).toContainText("Welcome to Pro!");
    await expect(
      page.locator("text=Your subscription is now active")
    ).toBeVisible();

    // Check API key display
    await expect(page.locator("code.font-mono")).toContainText(
      "forge_test...34567890"
    );

    // Check copy button
    const copyButton = page.locator("button").filter({ hasText: "Copy" });
    await expect(copyButton).toBeVisible();

    // Test copy functionality
    await copyButton.click();
    await expect(copyButton).toContainText("Copied!");
  });

  test("should handle error state", async ({ page }) => {
    // Mock API error response
    await page.route("**/billing/key?session_id=*", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Session not found" }),
      });
    });

    await page.goto("/pricing/success?session_id=invalid_session");

    // Check error state
    await expect(page.locator("h1")).toContainText("Error");
    await expect(page.locator("text=Failed to retrieve API key")).toBeVisible();
  });

  test("should handle missing session ID", async ({ page }) => {
    await page.goto("/pricing/success");

    // Check error state for missing session ID
    await expect(page.locator("h1")).toContainText("Error");
    await expect(page.locator("text=No session ID provided")).toBeVisible();
  });
});

test.describe("Pricing Cancel Page", () => {
  test("should display cancel page correctly", async ({ page }) => {
    await page.goto("/pricing/cancel");

    // Check page elements
    await expect(page.locator("h1")).toContainText("Checkout Cancelled");
    await expect(
      page.locator("text=No worries! You can try again anytime")
    ).toBeVisible();

    // Check retry buttons
    await expect(
      page.locator("a[href='/pricing']").filter({ hasText: "Choose a Plan" })
    ).toBeVisible();
    await expect(
      page.locator("a[href='/']").filter({ hasText: "Back to Home" })
    ).toBeVisible();

    // Check support section
    await expect(page.locator("h3")).toContainText("Need help?");
    await expect(page.locator("text=Contact Support")).toBeVisible();
  });
});

test.describe("Pricing Navigation", () => {
  test("should navigate to pricing from header", async ({ page }) => {
    await page.goto("/");

    // Click pricing link in header
    await page.locator("a[href='/pricing']").click();

    // Verify we're on pricing page
    await expect(page).toHaveURL("/pricing");
    await expect(page.locator("h1")).toContainText(
      "Simple, transparent pricing"
    );
  });

  test("should navigate back to home from cancel page", async ({ page }) => {
    await page.goto("/pricing/cancel");

    // Click home link
    await page
      .locator("a[href='/']")
      .filter({ hasText: "Back to Home" })
      .click();

    // Verify we're on home page
    await expect(page).toHaveURL("/");
  });
});
