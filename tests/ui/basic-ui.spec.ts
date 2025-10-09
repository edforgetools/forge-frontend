import { test, expect } from "@playwright/test";

test.describe("Basic UI Tests", () => {
  test("should load the application", async ({ page }) => {
    // Navigate to the application
    await page.goto("/");

    // Check if the page loads successfully
    await expect(page).toHaveTitle(/Forge/);
  });

  test("should be accessible", async ({ page }) => {
    await page.goto("/");

    // Basic accessibility check - ensure main content is present
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });

  test("no major bounding box overlaps", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });

    // Wait for the page to fully render
    await page.waitForTimeout(1000);

    const overlaps = await page.evaluate(() => {
      const elems = [...document.querySelectorAll("*")];
      const rects = elems.map((el) => el.getBoundingClientRect());
      let overlapCount = 0;
      const overlapDetails: Array<{
        elementA: string;
        elementB: string;
        overlapArea: number;
        aRect: { left: number; top: number; width: number; height: number };
        bRect: { left: number; top: number; width: number; height: number };
      }> = [];

      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i],
            b = rects[j];

          // Skip elements with zero dimensions
          if (
            a.width === 0 ||
            a.height === 0 ||
            b.width === 0 ||
            b.height === 0
          ) {
            continue;
          }

          // Skip elements that are completely outside the viewport
          if (
            a.right < 0 ||
            a.left > window.innerWidth ||
            a.bottom < 0 ||
            a.top > window.innerHeight
          ) {
            continue;
          }
          if (
            b.right < 0 ||
            b.left > window.innerWidth ||
            b.bottom < 0 ||
            b.top > window.innerHeight
          ) {
            continue;
          }

          // Check for overlap
          const overlap = !(
            b.left > a.right ||
            b.right < a.left ||
            b.top > a.bottom ||
            b.bottom < a.top
          );

          // Only count significant overlaps (both elements > 50px width)
          if (overlap && a.width > 50 && b.width > 50) {
            overlapCount++;

            // Calculate overlap area for debugging
            const overlapLeft = Math.max(a.left, b.left);
            const overlapRight = Math.min(a.right, b.right);
            const overlapTop = Math.max(a.top, b.top);
            const overlapBottom = Math.min(a.bottom, b.bottom);
            const overlapWidth = Math.max(0, overlapRight - overlapLeft);
            const overlapHeight = Math.max(0, overlapBottom - overlapTop);
            const overlapArea = overlapWidth * overlapHeight;

            overlapDetails.push({
              elementA:
                elems[i].tagName +
                (elems[i].className
                  ? "." + elems[i].className.split(" ").join(".")
                  : ""),
              elementB:
                elems[j].tagName +
                (elems[j].className
                  ? "." + elems[j].className.split(" ").join(".")
                  : ""),
              overlapArea: Math.round(overlapArea),
              aRect: {
                left: Math.round(a.left),
                top: Math.round(a.top),
                width: Math.round(a.width),
                height: Math.round(a.height),
              },
              bRect: {
                left: Math.round(b.left),
                top: Math.round(b.top),
                width: Math.round(b.width),
                height: Math.round(b.height),
              },
            });
          }
        }
      }

      return {
        overlapCount,
        overlapDetails: overlapDetails.slice(0, 10), // Limit to first 10 for debugging
      };
    });

    // Log overlap details for debugging
    if (overlaps.overlapCount > 0) {
      console.log("Overlap details:", overlaps.overlapDetails);
    }

    // Expect fewer than 5 significant overlaps
    expect(overlaps.overlapCount).toBeLessThan(5);
  });
});
