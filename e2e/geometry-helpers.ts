import { expect, Page } from "@playwright/test";

/**
 * Helper function to check that UI elements do not overlap by examining their client rect intersections.
 * This is useful for ensuring proper layout and preventing UI elements from interfering with each other.
 *
 * @param page - Playwright page object
 * @param selectors - Array of CSS selectors to check for overlaps
 * @param options - Optional configuration for the overlap check
 */
export async function expectNoOverlap(
  page: Page,
  selectors: string[],
  options: {
    /** Minimum overlap area in pixels to consider significant (default: 1) */
    minOverlapArea?: number;
    /** Whether to include elements that are not visible (default: false) */
    includeHidden?: boolean;
    /** Custom error message for when overlaps are found */
    customMessage?: string;
  } = {}
) {
  const { minOverlapArea = 1, includeHidden = false, customMessage } = options;

  // Get bounding boxes for all selectors
  const boundingBoxes = await page.evaluate(
    ({ selectors, includeHidden }) => {
      const results: Array<{
        selector: string;
        element: Element | null;
        boundingBox: DOMRect | null;
        isVisible: boolean;
      }> = [];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (!element) {
          results.push({
            selector,
            element: null,
            boundingBox: null,
            isVisible: false,
          });
          continue;
        }

        const isVisible =
          element instanceof HTMLElement &&
          element.offsetParent !== null &&
          getComputedStyle(element).visibility !== "hidden" &&
          getComputedStyle(element).display !== "none";

        if (!includeHidden && !isVisible) {
          results.push({
            selector,
            element,
            boundingBox: null,
            isVisible: false,
          });
          continue;
        }

        const boundingBox = element.getBoundingClientRect();
        results.push({
          selector,
          element,
          boundingBox,
          isVisible,
        });
      }

      return results;
    },
    { selectors, includeHidden }
  );

  // Check for overlaps between all pairs of elements
  const overlaps: Array<{
    selectorA: string;
    selectorB: string;
    overlapArea: number;
    boundingBoxA: DOMRect;
    boundingBoxB: DOMRect;
  }> = [];

  for (let i = 0; i < boundingBoxes.length; i++) {
    for (let j = i + 1; j < boundingBoxes.length; j++) {
      const boxA = boundingBoxes[i];
      const boxB = boundingBoxes[j];

      // Skip if either element doesn't exist or isn't visible
      if (
        !boxA.boundingBox ||
        !boxB.boundingBox ||
        !boxA.isVisible ||
        !boxB.isVisible
      ) {
        continue;
      }

      // Skip if either element has zero dimensions
      if (
        boxA.boundingBox.width === 0 ||
        boxA.boundingBox.height === 0 ||
        boxB.boundingBox.width === 0 ||
        boxB.boundingBox.height === 0
      ) {
        continue;
      }

      // Calculate overlap area
      const overlapLeft = Math.max(
        boxA.boundingBox.left,
        boxB.boundingBox.left
      );
      const overlapRight = Math.min(
        boxA.boundingBox.right,
        boxB.boundingBox.right
      );
      const overlapTop = Math.max(boxA.boundingBox.top, boxB.boundingBox.top);
      const overlapBottom = Math.min(
        boxA.boundingBox.bottom,
        boxB.boundingBox.bottom
      );

      const overlapWidth = Math.max(0, overlapRight - overlapLeft);
      const overlapHeight = Math.max(0, overlapBottom - overlapTop);
      const overlapArea = overlapWidth * overlapHeight;

      if (overlapArea >= minOverlapArea) {
        overlaps.push({
          selectorA: boxA.selector,
          selectorB: boxB.selector,
          overlapArea: Math.round(overlapArea),
          boundingBoxA: boxA.boundingBox,
          boundingBoxB: boxB.boundingBox,
        });
      }
    }
  }

  // Log overlap details for debugging
  if (overlaps.length > 0) {
    console.log("Found overlapping elements:");
    overlaps.forEach((overlap) => {
      console.log(
        `  ${overlap.selectorA} overlaps with ${overlap.selectorB} (${overlap.overlapArea}px²)`
      );
      console.log(
        `    ${overlap.selectorA}: ${JSON.stringify({
          left: Math.round(overlap.boundingBoxA.left),
          top: Math.round(overlap.boundingBoxA.top),
          width: Math.round(overlap.boundingBoxA.width),
          height: Math.round(overlap.boundingBoxA.height),
        })}`
      );
      console.log(
        `    ${overlap.selectorB}: ${JSON.stringify({
          left: Math.round(overlap.boundingBoxB.left),
          top: Math.round(overlap.boundingBoxB.top),
          width: Math.round(overlap.boundingBoxB.width),
          height: Math.round(overlap.boundingBoxB.height),
        })}`
      );
    });
  }

  // Assert no overlaps
  const errorMessage =
    customMessage ||
    `Expected no overlap between elements, but found ${overlaps.length} overlap(s): ${overlaps.map((o) => `${o.selectorA} ↔ ${o.selectorB}`).join(", ")}`;

  expect(overlaps.length, errorMessage).toBe(0);
}

/**
 * Specific helper for checking that the shortcuts dialog doesn't overlap with key UI elements.
 * This is a convenience function that uses the common selectors for the shortcuts dialog
 * and the main UI components it might interfere with.
 */
export async function expectShortcutsDialogNoOverlap(page: Page) {
  await expectNoOverlap(
    page,
    [
      '[role="dialog"]', // shortcuts dialog
      '[data-testid="editor-layout"]', // main editor grid
      "aside:last-of-type", // export panel (right sidebar)
      "header", // topbar
    ],
    {
      minOverlapArea: 1,
      includeHidden: false,
      customMessage:
        "Shortcuts dialog should not overlap with editor grid, export panel, or topbar",
    }
  );
}
