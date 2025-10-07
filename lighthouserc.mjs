export default {
  ci: {
    collect: {
      url: ["http://localhost:5183"],
      startServerCommand: "pnpm preview",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.7 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
        // Disable specific problematic assertions for CI
        "errors-in-console": "off",
        "heading-order": "off",
        "network-dependency-tree-insight": "off",
        "unused-javascript": "off",
        "legacy-javascript": "off",
        "render-blocking-insight": "off",
        "render-blocking-resources": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
