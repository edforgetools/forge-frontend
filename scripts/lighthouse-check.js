#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Start preview server
const preview = spawn("pnpm", ["preview"], {
  cwd: projectRoot,
  stdio: "pipe",
});

let serverReady = false;

preview.stdout.on("data", (data) => {
  const output = data.toString();
  if (output.includes("Local:") && !serverReady) {
    serverReady = true;
    console.log("✅ Preview server ready");

    // Run Lighthouse
    const lighthouse = spawn(
      "npx",
      ["lighthouse", "http://localhost:5183", "--output=json", "--quiet"],
      {
        cwd: projectRoot,
        stdio: "pipe",
      }
    );

    let lighthouseOutput = "";

    lighthouse.stdout.on("data", (data) => {
      lighthouseOutput += data.toString();
    });

    lighthouse.on("close", () => {
      try {
        const results = JSON.parse(lighthouseOutput);
        const scores = {
          performance: Math.round(results.categories.performance.score * 100),
          accessibility: Math.round(
            results.categories.accessibility.score * 100
          ),
          "best-practices": Math.round(
            results.categories["best-practices"].score * 100
          ),
          seo: Math.round(results.categories.seo.score * 100),
        };

        console.log("\n📊 Lighthouse Results:");
        console.log(`Performance: ${scores.performance}/100`);
        console.log(`Accessibility: ${scores.accessibility}/100`);
        console.log(`Best Practices: ${scores["best-practices"]}/100`);
        console.log(`SEO: ${scores.seo}/100`);

        // Check if scores meet minimum requirements
        const minScores = {
          performance: 30,
          accessibility: 70,
          "best-practices": 50,
          seo: 60,
        };
        let passed = true;

        for (const [category, score] of Object.entries(scores)) {
          if (score < minScores[category]) {
            console.log(`❌ ${category}: ${score} < ${minScores[category]}`);
            passed = false;
          } else {
            console.log(`✅ ${category}: ${score} >= ${minScores[category]}`);
          }
        }

        if (passed) {
          console.log("\n🎉 All Lighthouse checks passed!");
          process.exit(0);
        } else {
          console.log("\n❌ Some Lighthouse checks failed");
          process.exit(1);
        }
      } catch (error) {
        console.error("Error parsing Lighthouse results:", error);
        process.exit(1);
      }
    });

    lighthouse.on("error", (error) => {
      console.error("Lighthouse error:", error);
      process.exit(1);
    });
  }
});

preview.on("error", (error) => {
  console.error("Preview server error:", error);
  process.exit(1);
});

// Cleanup on exit
process.on("SIGINT", () => {
  preview.kill();
  process.exit(0);
});
