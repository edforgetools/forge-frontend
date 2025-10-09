# UI Tests

This directory contains automated UI/UX tests using Playwright and Lighthouse.

## Test Types

- **UI Tests**: End-to-end tests for user interface interactions
- **Accessibility Tests**: Tests using @axe-core/playwright for accessibility compliance
- **Performance Tests**: Lighthouse-based performance and UX audits

## Running Tests

```bash
# Run all tests (e2e + UI)
pnpm test

# Run tests in CI mode
pnpm test:ci

# Run only UI tests
pnpm exec playwright test --project=ui-chromium
pnpm exec playwright test --project=ui-firefox
pnpm exec playwright test --project=ui-webkit

# Run specific UI test file
pnpm exec playwright test tests/ui/basic-ui.spec.ts

# Run tests with UI mode for debugging
pnpm exec playwright test --ui
```

## Test Structure

- `*.spec.ts` - Playwright test files
- `fixtures/` - Test data and fixtures (if needed)
- `helpers/` - Shared test utilities (if needed)

## Lighthouse Integration

Lighthouse audits are configured in:

- `scripts/lighthouse-check.js` - Lighthouse runner script
- `lighthouserc.json` - Lighthouse CI configuration
