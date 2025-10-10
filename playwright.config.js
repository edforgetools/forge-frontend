var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: { headless: true, viewport: { width: 1440, height: 900 } },
  projects: [
    {
      name: "chromium",
      use: __assign(__assign({}, devices["Desktop Chrome"]), {
        headless: true,
      }),
    },
    {
      name: "firefox",
      use: __assign(__assign({}, devices["Desktop Firefox"]), {
        headless: true,
      }),
    },
    {
      name: "webkit",
      use: __assign(__assign({}, devices["Desktop Safari"]), {
        headless: true,
      }),
    },
  ],
  webServer: {
    command: "pnpm dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
