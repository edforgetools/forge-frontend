#!/usr/bin/env node

/**
 * Hallucination Detector
 *
 * Finds code paths that reference non-existent symbols, routes, envs, or packages.
 * This script helps identify potential "hallucinated" code that references
 * non-existent resources.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

// Configuration
const CONFIG = {
  srcDir: join(PROJECT_ROOT, "src"),
  excludeDirs: ["node_modules", ".git", "dist", "build"],
  fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
  envSchemaPath: join(PROJECT_ROOT, "src", "env.ts"),
  packageJsonPath: join(PROJECT_ROOT, "package.json"),
};

// Results storage
const issues = {
  imports: [],
  envVars: [],
  routes: [],
  symbols: [],
  packages: [],
};

/**
 * Check if a file should be analyzed
 */
function shouldAnalyzeFile(filePath) {
  const ext = extname(filePath);
  return CONFIG.fileExtensions.includes(ext);
}

/**
 * Recursively find all source files
 */
function findSourceFiles(dir) {
  const files = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!CONFIG.excludeDirs.includes(entry)) {
          files.push(...findSourceFiles(fullPath));
        }
      } else if (shouldAnalyzeFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }

  return files;
}

/**
 * Extract import statements from file content
 */
function extractImports(content) {
  const imports = [];

  // Match import statements
  const importRegex =
    /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      module: match[1],
      line: content.substring(0, match.index).split("\n").length,
      fullMatch: match[0],
    });
  }

  return imports;
}

/**
 * Extract environment variable references
 */
function extractEnvVars(content) {
  const envVars = [];

  // Match import.meta.env references
  const envRegex = /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g;
  let match;

  while ((match = envRegex.exec(content)) !== null) {
    envVars.push({
      name: match[1],
      line: content.substring(0, match.index).split("\n").length,
      fullMatch: match[0],
    });
  }

  return envVars;
}

/**
 * Extract route references
 */
function extractRoutes(content) {
  const routes = [];

  // Match route patterns
  const routeRegex = /(?:path=|to=)['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({
      path: match[1],
      line: content.substring(0, match.index).split("\n").length,
      fullMatch: match[0],
    });
  }

  return routes;
}

/**
 * Check if a module exists
 */
function checkModuleExists(modulePath, filePath) {
  // Skip node_modules imports
  if (
    modulePath.startsWith("node_modules/") ||
    (!modulePath.startsWith("./") &&
      !modulePath.startsWith("../") &&
      !modulePath.startsWith("@/"))
  ) {
    return { exists: true, reason: "external package" };
  }

  // Handle @/ alias
  if (modulePath.startsWith("@/")) {
    const resolvedPath = join(PROJECT_ROOT, "src", modulePath.substring(2));
    try {
      statSync(resolvedPath + ".ts");
      return { exists: true, reason: "found .ts file" };
    } catch {
      try {
        statSync(resolvedPath + ".tsx");
        return { exists: true, reason: "found .tsx file" };
      } catch {
        try {
          statSync(resolvedPath + "/index.ts");
          return { exists: true, reason: "found index.ts" };
        } catch {
          try {
            statSync(resolvedPath + "/index.tsx");
            return { exists: true, reason: "found index.tsx" };
          } catch {
            return { exists: false, reason: "no matching file found" };
          }
        }
      }
    }
  }

  // Handle relative imports
  const resolvedPath = join(dirname(filePath), modulePath);
  try {
    statSync(resolvedPath + ".ts");
    return { exists: true, reason: "found .ts file" };
  } catch {
    try {
      statSync(resolvedPath + ".tsx");
      return { exists: true, reason: "found .tsx file" };
    } catch {
      try {
        statSync(resolvedPath + "/index.ts");
        return { exists: true, reason: "found index.ts" };
      } catch {
        try {
          statSync(resolvedPath + "/index.tsx");
          return { exists: true, reason: "found index.tsx" };
        } catch {
          return { exists: false, reason: "no matching file found" };
        }
      }
    }
  }
}

/**
 * Get defined environment variables from env.ts
 */
function getDefinedEnvVars() {
  try {
    const envContent = readFileSync(CONFIG.envSchemaPath, "utf8");
    const envVars = [];

    // Extract VITE_* variables from env schema
    const envRegex = /VITE_[A-Z_][A-Z0-9_]*/g;
    let match;

    while ((match = envRegex.exec(envContent)) !== null) {
      envVars.push(match[0]);
    }

    // Add built-in Vite environment variables
    envVars.push("DEV", "PROD", "MODE", "BASE_URL", "SSR");

    return envVars;
  } catch (error) {
    console.warn(`Warning: Could not read env schema: ${error.message}`);
    return ["DEV", "PROD", "MODE", "BASE_URL", "SSR"]; // Fallback to built-in vars
  }
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    const relativePath = filePath.replace(PROJECT_ROOT, "");

    // Extract imports
    const imports = extractImports(content);
    for (const imp of imports) {
      const moduleCheck = checkModuleExists(imp.module, filePath);
      if (!moduleCheck.exists) {
        issues.imports.push({
          file: relativePath,
          line: imp.line,
          module: imp.module,
          reason: moduleCheck.reason,
          fullMatch: imp.fullMatch,
        });
      }
    }

    // Extract environment variables
    const envVars = extractEnvVars(content);
    const definedEnvVars = getDefinedEnvVars();
    for (const envVar of envVars) {
      if (!definedEnvVars.includes(envVar.name)) {
        issues.envVars.push({
          file: relativePath,
          line: envVar.line,
          name: envVar.name,
          fullMatch: envVar.fullMatch,
        });
      }
    }

    // Extract routes
    const routes = extractRoutes(content);
    for (const route of routes) {
      issues.routes.push({
        file: relativePath,
        line: route.line,
        path: route.path,
        fullMatch: route.fullMatch,
      });
    }
  } catch (error) {
    console.warn(
      `Warning: Could not analyze file ${filePath}: ${error.message}`
    );
  }
}

/**
 * Print results
 */
function printResults() {
  console.log("🔍 Hallucination Detection Results\n");

  let totalIssues = 0;

  // Import issues
  if (issues.imports.length > 0) {
    console.log(`❌ Import Issues (${issues.imports.length}):`);
    issues.imports.forEach((issue) => {
      console.log(
        `  ${issue.file}:${issue.line} - Module "${issue.module}" not found (${issue.reason})`
      );
    });
    console.log();
    totalIssues += issues.imports.length;
  }

  // Environment variable issues
  if (issues.envVars.length > 0) {
    console.log(`❌ Environment Variable Issues (${issues.envVars.length}):`);
    issues.envVars.forEach((issue) => {
      console.log(
        `  ${issue.file}:${issue.line} - Environment variable "${issue.name}" not defined in env schema`
      );
    });
    console.log();
    totalIssues += issues.envVars.length;
  }

  // Route issues (informational)
  if (issues.routes.length > 0) {
    console.log(`ℹ️  Route References (${issues.routes.length}):`);
    issues.routes.forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line} - Route "${issue.path}"`);
    });
    console.log();
  }

  // Summary
  if (totalIssues === 0) {
    console.log("✅ No hallucination issues found!");
  } else {
    console.log(`⚠️  Total issues found: ${totalIssues}`);
    console.log("\nRecommendations:");
    console.log("1. Fix or remove non-existent imports");
    console.log("2. Add missing environment variables to env.ts schema");
    console.log("3. Verify all routes are properly defined");
    console.log("4. Add runtime guards for critical paths");
  }
}

/**
 * Main function
 */
function main() {
  console.log("🔍 Starting hallucination detection...\n");

  const sourceFiles = findSourceFiles(CONFIG.srcDir);
  console.log(`📁 Found ${sourceFiles.length} source files to analyze\n`);

  for (const file of sourceFiles) {
    analyzeFile(file);
  }

  printResults();
}

// Run the detector
main();
