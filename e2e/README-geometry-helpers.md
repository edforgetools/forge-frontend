# Geometry Assertions Helper

This directory contains helper functions for testing UI element geometry and ensuring no unwanted overlaps between components.

## expectNoOverlap Helper Function

The `expectNoOverlap` helper function checks that UI elements do not overlap by examining their client rect intersections. This is useful for ensuring proper layout and preventing UI elements from interfering with each other.

### Usage

```typescript
import { expectNoOverlap } from "./geometry-helpers";

// Basic usage
await expectNoOverlap(page, [
  '[role="dialog"]', // shortcuts dialog
  '[data-testid="editor-layout"]', // editor grid
  "aside:last-of-type", // export panel
  "header", // topbar
]);

// With custom options
await expectNoOverlap(page, selectors, {
  minOverlapArea: 10, // Only consider overlaps > 10px²
  includeHidden: false, // Skip hidden elements
  customMessage: "Custom error message",
});
```

### Parameters

- `page`: Playwright page object
- `selectors`: Array of CSS selectors to check for overlaps
- `options`: Optional configuration object
  - `minOverlapArea`: Minimum overlap area in pixels to consider significant (default: 1)
  - `includeHidden`: Whether to include elements that are not visible (default: false)
  - `customMessage`: Custom error message for when overlaps are found

### Example: Shortcuts Dialog vs Main UI Elements

```typescript
test("shortcuts dialog should not overlap with main UI", async ({ page }) => {
  // Open shortcuts dialog
  await page.keyboard.press("?");
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // Check for overlaps
  await expectNoOverlap(
    page,
    [
      '[role="dialog"]', // shortcuts dialog
      '[data-testid="editor-layout"]', // editor grid
      "aside:last-of-type", // export panel (right sidebar)
      "header", // topbar
    ],
    {
      minOverlapArea: 1,
      customMessage:
        "Shortcuts dialog should not overlap with editor grid, export panel, or topbar",
    }
  );
});
```

### Convenience Function: expectShortcutsDialogNoOverlap

For the specific case of checking shortcuts dialog overlaps, there's a convenience function:

```typescript
import { expectShortcutsDialogNoOverlap } from "./geometry-helpers";

test("shortcuts dialog no overlap", async ({ page }) => {
  await page.keyboard.press("?");
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  await expectShortcutsDialogNoOverlap(page);
});
```

## Selector Reference

Based on the codebase analysis, here are the correct selectors for the main UI elements:

- **Shortcuts Dialog**: `[role="dialog"]` (when open)
- **Editor Grid**: `[data-testid="editor-layout"]` or `.editor-grid`
- **Export Panel**: `aside:last-of-type` (right sidebar)
- **Topbar**: `header`
- **Left Sidebar**: `aside:first-of-type` (tools panel)
- **Main Content**: `main`

## Error Reporting

When overlaps are detected, the helper provides detailed information including:

- Which elements are overlapping
- The overlap area in pixels
- Bounding box coordinates for both elements
- Custom error message (if provided)

Example error output:

```
Found overlapping elements:
  [role="dialog"] overlaps with header (150px²)
    [role="dialog"]: {"left": 100, "top": 50, "width": 400, "height": 300}
    header: {"left": 0, "top": 0, "width": 1440, "height": 80}
```

## Test Files

- `geometry-helpers.ts` - The main helper functions
- `geometry-helper-demo.spec.ts` - Basic demonstrations of the helper
- `shortcuts-geometry-example.spec.ts` - Specific example for shortcuts dialog
- `geometry-assertions.spec.ts` - Comprehensive tests (may need shortcuts dialog to be working)

## Notes

- The helper automatically skips elements with zero dimensions
- Hidden elements are excluded by default (set `includeHidden: true` to include them)
- The function works with any CSS selectors supported by Playwright
- Use `minOverlapArea` to filter out insignificant overlaps
- The helper provides detailed debugging information when overlaps are found
