#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const distPath = join(process.cwd(), "dist", "bundle-analysis.html");
const docsPath = join(process.cwd(), "docs", "bundle.html");

try {
  // Create docs directory if it doesn't exist
  mkdirSync(join(process.cwd(), "docs"), { recursive: true });

  // Read the bundle analysis file
  const bundleAnalysis = readFileSync(distPath, "utf8");

  // Write to docs folder
  writeFileSync(docsPath, bundleAnalysis);

  console.log("✅ Bundle analysis moved to docs/bundle.html");
} catch (error) {
  console.error("❌ Failed to move bundle analysis:", error.message);
  process.exit(1);
}
