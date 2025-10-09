import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/a11y-smoke.spec.ts", // Focus on smoke tests only
  use: {
    headless: true,
    // Default viewport for desktop testing
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 12"],
        headless: true,
        viewport: { width: 375, height: 667 },
      },
    },
  ],
  webServer: {
    command: "pnpm dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  // Fail fast on accessibility violations - no retries for smoke tests
  retries: 0,
  // Generate detailed reports for accessibility issues
  reporter: [
    ["html", { outputFolder: "playwright-report/a11y-smoke" }],
    ["json", { outputFile: "test-results/a11y-smoke-results.json" }],
    ["junit", { outputFile: "test-results/a11y-smoke-results.xml" }],
  ],
  // Timeout settings optimized for smoke tests
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});
