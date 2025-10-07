export default {
  ci: {
    collect: {
      url: ["http://localhost:4173"],
      startServerCommand: "pnpm preview --port 4173",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
        // Explicitly disable PWA category
        "categories:pwa": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
