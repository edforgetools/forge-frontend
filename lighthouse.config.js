module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:5173/", "http://localhost:5173/app"],
      startServerCommand: "yarn dev",
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.85 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
