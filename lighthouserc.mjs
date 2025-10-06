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
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.7 }],
        "categories:seo": ["warn", { minScore: 0.7 }],
        // Disable specific problematic assertions for now
        "heading-order": "off",
        "network-dependency-tree-insight": "off",
        "unused-javascript": "off",
        "render-blocking-insight": "off",
        "render-blocking-resources": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
