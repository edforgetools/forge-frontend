#!/usr/bin/env ts-node

/**
 * Verification script for dead code cleanup
 * Ensures no broken imports or missing dependencies after cleanup
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const deletedFiles = [
  "src/components/ui/icon.tsx",
  "src/components/ui/lazy.tsx",
  "src/components/SnapthumbEditor.tsx",
  "src/components/AppShell.tsx",
];

const cleanupVerification = {
  // Check that deleted files are actually gone
  verifyFilesDeleted: () => {
    console.log("🔍 Verifying deleted files...");

    deletedFiles.forEach((file) => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        throw new Error(`❌ File still exists: ${file}`);
      }
      console.log(`✅ Confirmed deleted: ${file}`);
    });
  },

  // Check for any broken imports
  verifyNoBrokenImports: () => {
    console.log("🔍 Checking for broken imports...");

    try {
      execSync("npx tsc --noEmit", { stdio: "pipe" });
      console.log("✅ TypeScript compilation successful");
    } catch (error) {
      console.error("❌ TypeScript compilation failed:");
      console.error(error.toString());
      throw error;
    }
  },

  // Check build process
  verifyBuild: () => {
    console.log("🔍 Verifying build process...");

    try {
      execSync("npm run build", { stdio: "pipe" });
      console.log("✅ Build process successful");
    } catch (error) {
      console.error("❌ Build process failed:");
      console.error(error.toString());
      throw error;
    }
  },

  // Check for any remaining references to deleted files
  verifyNoReferences: () => {
    console.log("🔍 Checking for remaining references...");

    deletedFiles.forEach((file) => {
      const fileName = path.basename(file, ".tsx");

      try {
        const result = execSync(`grep -r "${fileName}" src/ || true`, {
          encoding: "utf8",
        });
        const references = result
          .trim()
          .split("\n")
          .filter((line) => line.trim());

        if (references.length > 0) {
          console.warn(`⚠️  Found potential references to ${fileName}:`);
          references.forEach((ref) => console.warn(`   ${ref}`));
        } else {
          console.log(`✅ No references found to ${fileName}`);
        }
      } catch {
        // grep returns exit code 1 when no matches found, which is expected
        console.log(`✅ No references found to ${fileName}`);
      }
    });
  },

  // Run all verification steps
  run: () => {
    console.log("🚀 Starting dead code cleanup verification...\n");

    try {
      cleanupVerification.verifyFilesDeleted();
      cleanupVerification.verifyNoBrokenImports();
      cleanupVerification.verifyBuild();
      cleanupVerification.verifyNoReferences();

      console.log("\n🎉 All verification steps passed!");
      console.log("✅ Dead code cleanup successful");
    } catch (error) {
      console.error("\n💥 Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  },
};

// Run verification if called directly
if (require.main === module) {
  cleanupVerification.run();
}

export default cleanupVerification;
