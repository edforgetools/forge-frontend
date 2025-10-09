import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: { headless: true, viewport: { width: 1440, height: 900 } },
  webServer: {
    command: "yarn dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
