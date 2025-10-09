import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { headless: true, viewport: { width: 1440, height: 900 } },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], headless: true },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], headless: true },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], headless: true },
    },
  ],
  webServer: {
    command: "pnpm dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
