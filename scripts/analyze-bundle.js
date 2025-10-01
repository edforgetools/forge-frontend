#!/usr/bin/env node

/**
 * Bundle Analysis Script
 *
 * This script builds the project and analyzes bundle sizes,
 * generating reports for performance monitoring.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔍 Starting bundle analysis...\n");

try {
  // Build the project
  console.log("📦 Building project...");
  execSync("npm run build:prod", { stdio: "inherit" });

  // Run bundlesize analysis
  console.log("\n📊 Running bundlesize analysis...");
  execSync("npx bundlesize", { stdio: "inherit" });

  // Check if bundle analysis HTML was generated
  const analysisPath = path.join(
    __dirname,
    "../artifacts/bundle-analysis.html"
  );
  if (fs.existsSync(analysisPath)) {
    console.log(`\n✅ Bundle analysis report generated: ${analysisPath}`);
    console.log(
      "   Open this file in your browser to view detailed bundle composition."
    );
  }

  console.log("\n🎉 Bundle analysis complete!");
  console.log("\n📋 Next steps:");
  console.log("   • Review artifacts/perf.md for current metrics");
  console.log("   • Check bundle-analysis.html for detailed composition");
  console.log("   • Integrate bundlesize into your CI/CD pipeline");
} catch (error) {
  console.error("❌ Bundle analysis failed:", error.message);
  process.exit(1);
}
