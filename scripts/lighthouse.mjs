#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";

/* global console, process */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Create reports directory
const reportsDir = join(projectRoot, "lighthouse-reports");
mkdirSync(reportsDir, { recursive: true });

// Start preview server
const preview = spawn("pnpm", ["preview"], {
  cwd: projectRoot,
  stdio: "pipe",
});

let serverReady = false;
const urls = ["http://localhost:4173/", "http://localhost:4173/app"];
const results = [];

preview.stdout.on("data", (data) => {
  const output = data.toString();
  if (output.includes("Local:") && !serverReady) {
    serverReady = true;
    console.log("✅ Preview server ready");

    // Run Lighthouse for each URL
    runLighthouseForUrls();
  }
});

async function runLighthouseForUrls() {
  for (const url of urls) {
    console.log(`\n🔍 Running Lighthouse on ${url}...`);

    const urlName = url
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    const reportPath = join(reportsDir, `lighthouse-${urlName}-mobile.html`);

    try {
      await runLighthouse(url, reportPath);
    } catch (error) {
      console.error(`❌ Error running Lighthouse on ${url}:`, error);
      process.exit(1);
    }
  }

  // Check results against thresholds
  checkThresholds();
}

function runLighthouse(url, reportPath) {
  return new Promise((resolve, reject) => {
    const lighthouse = spawn(
      "npx",
      [
        "lighthouse",
        url,
        "--output=json,html",
        "--output-path=" + reportPath.replace(".html", ""),
        "--chrome-flags=--headless",
        "--emulated-form-factor=mobile",
        "--throttling-method=devtools",
        "--quiet",
      ],
      {
        cwd: projectRoot,
        stdio: "pipe",
      }
    );

    let lighthouseOutput = "";

    lighthouse.stdout.on("data", (data) => {
      lighthouseOutput += data.toString();
    });

    lighthouse.on("close", (code) => {
      if (code === 0) {
        try {
          const results = JSON.parse(lighthouseOutput);
          const scores = {
            url: url,
            performance: results.categories.performance.score,
            accessibility: results.categories.accessibility.score,
            seo: results.categories.seo.score,
            pwa: results.categories.pwa ? results.categories.pwa.score : null,
          };

          results.push(scores);
          console.log(`✅ Lighthouse completed for ${url}`);
          console.log(
            `   Performance: ${Math.round(scores.performance * 100)}/100`
          );
          console.log(
            `   Accessibility: ${Math.round(scores.accessibility * 100)}/100`
          );
          console.log(`   SEO: ${Math.round(scores.seo * 100)}/100`);
          console.log(`   Report saved: ${reportPath}`);

          resolve(scores);
        } catch (error) {
          reject(
            new Error(`Failed to parse Lighthouse results: ${error.message}`)
          );
        }
      } else {
        reject(new Error(`Lighthouse exited with code ${code}`));
      }
    });

    lighthouse.on("error", (error) => {
      reject(error);
    });
  });
}

function checkThresholds() {
  console.log("\n📊 Checking thresholds...");

  const thresholds = {
    performance: 0.9,
    accessibility: 0.95,
    seo: 1.0,
    pwa: null, // PWA off
  };

  let allPassed = true;

  for (const result of results) {
    console.log(`\n🔍 Results for ${result.url}:`);

    for (const [category, threshold] of Object.entries(thresholds)) {
      if (threshold === null) continue; // Skip PWA

      const score = result[category];
      const passed = score >= threshold;

      if (passed) {
        console.log(
          `✅ ${category}: ${Math.round(score * 100)}/100 >= ${Math.round(
            threshold * 100
          )}`
        );
      } else {
        console.log(
          `❌ ${category}: ${Math.round(score * 100)}/100 < ${Math.round(
            threshold * 100
          )}`
        );
        allPassed = false;
      }
    }
  }

  if (allPassed) {
    console.log("\n🎉 All Lighthouse mobile checks passed!");
    console.log(`📁 HTML reports saved in: ${reportsDir}`);
    process.exit(0);
  } else {
    console.log("\n❌ Some Lighthouse mobile checks failed");
    console.log(`📁 HTML reports saved in: ${reportsDir}`);
    process.exit(1);
  }
}

preview.on("error", (error) => {
  console.error("Preview server error:", error);
  process.exit(1);
});

// Cleanup on exit
process.on("SIGINT", () => {
  preview.kill();
  process.exit(0);
});
