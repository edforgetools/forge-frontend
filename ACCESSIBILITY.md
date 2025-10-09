# Accessibility Testing

This project uses [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) to ensure accessibility compliance and prevent regressions.

## Requirements

The accessibility tests enforce the following critical requirements:

- **Color Contrast**: All text must have a contrast ratio of at least 4.5:1 (WCAG AA)
- **Interactive Elements**: All interactive elements must be at least 44×44 pixels on mobile devices
- **Additional WCAG 2.1 AA compliance**: Button names, image alt text, labels, links, headings, and more

## Running Accessibility Tests

### Local Development

```bash
# Run accessibility smoke tests
pnpm test:a11y

# Run all accessibility tests (comprehensive)
playwright test e2e/a11y.spec.ts
```

### CI/CD

```bash
# Run accessibility tests in CI mode
pnpm test:a11y:ci
```

## Test Files

- `e2e/a11y-smoke.spec.ts` - Essential accessibility smoke tests (fast, CI-friendly)
- `e2e/a11y.spec.ts` - Comprehensive accessibility test suite
- `playwright.a11y.config.ts` - Dedicated Playwright configuration for accessibility testing

## Build Integration

Accessibility tests are automatically run in the CI pipeline and will **fail the build** if violations are found:

```bash
# Full CI pipeline includes accessibility testing
pnpm ci
```

The CI pipeline runs:

1. Build
2. Unit/E2E tests
3. **Accessibility tests** ← Will fail build on violations
4. Size limits
5. Lighthouse performance tests

## Test Configuration

The accessibility tests use the following configuration:

- **Desktop viewport**: 1440×900
- **Mobile viewport**: 375×667 (iPhone 12)
- **WCAG standards**: 2.1 AA compliance
- **Critical rules**: color-contrast, target-size, button-name, image-alt, label, link-name, html-has-lang, page-has-heading-one

## Viewing Results

Test results are generated in multiple formats:

- HTML report: `playwright-report/index.html`
- JSON results: `test-results/a11y-results.json`
- JUnit XML: `test-results/a11y-results.xml`

## Fixing Violations

When accessibility violations are found:

1. **Check the console output** for detailed violation information
2. **Review the HTML report** for visual context
3. **Fix the issues** in your components
4. **Re-run the tests** to verify fixes

Common fixes:

- **Color contrast**: Adjust text/background colors to meet 4.5:1 ratio
- **Target size**: Increase button/link dimensions to at least 44×44px on mobile
- **Missing labels**: Add proper `aria-label` or associated `<label>` elements
- **Image alt text**: Add descriptive `alt` attributes to images

## Continuous Monitoring

The accessibility tests run automatically on:

- Every pull request
- Every merge to main
- Local development (when running `pnpm test:a11y`)

This ensures accessibility standards are maintained throughout the development process.
