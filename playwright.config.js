var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0, // Reduced retries for faster CI
    workers: process.env.CI ? 1 : undefined,
    timeout: process.env.CI ? 30000 : 60000, // 30 seconds in CI, 60 locally
    expect: {
        timeout: process.env.CI ? 5000 : 10000, // 5 seconds in CI, 10 locally
    },
    use: {
        // CI uses the preview server started in the workflow
        // Local runs fall back to 4173 or whatever you export
        baseURL: process.env.PLAYWRIGHT_BASE_URL ||
            process.env.PREVIEW_URL ||
            "http://127.0.0.1:4173",
        trace: "on-first-retry",
    },
    projects: [
        { name: "chromium", use: __assign({}, devices["Desktop Chrome"]) },
        { name: "firefox", use: __assign({}, devices["Desktop Firefox"]) },
        { name: "webkit", use: __assign({}, devices["Desktop Safari"]) },
    ],
    // Do not auto-start a dev server on CI; the workflow already starts preview.
    webServer: process.env.CI
        ? undefined
        : {
            command: "pnpm dev",
            url: "http://localhost:5173",
            reuseExistingServer: true,
        },
});
