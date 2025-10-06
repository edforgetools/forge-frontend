#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const packageJsonPath = "./package.json";
const changelogPath = "./CHANGELOG.md";

// Read current version
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const currentVersion = packageJson.version;

// Parse version parts
const [major, minor, patch] = currentVersion.split(".").map(Number);

// Determine version bump type from command line argument
const bumpType = process.argv[2] || "patch";
let newVersion;

switch (bumpType) {
  case "major":
    newVersion = `${major + 1}.0.0`;
    break;
  case "minor":
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case "patch":
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

// Update CHANGELOG.md
const changelog = readFileSync(changelogPath, "utf8");
const today = new Date().toISOString().split("T")[0];
const newChangelog = changelog.replace(
  "## [Unreleased]",
  `## [Unreleased]\n\n## [${newVersion}] - ${today}`
);
writeFileSync(changelogPath, newChangelog);

// Create git commit and tag
try {
  execSync(`git add package.json CHANGELOG.md`, { stdio: "inherit" });
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, {
    stdio: "inherit",
  });
  execSync(`git tag v${newVersion}`, { stdio: "inherit" });
  console.log(`✅ Version bumped to ${newVersion}`);
  console.log(`📝 CHANGELOG.md updated`);
  console.log(`🏷️  Git tag v${newVersion} created`);
} catch (error) {
  console.error("❌ Error creating git commit/tag:", error.message);
  process.exit(1);
}
