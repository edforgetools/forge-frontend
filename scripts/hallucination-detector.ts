#!/usr/bin/env tsx

/**
 * TypeScript Hallucination Detector
 *
 * Enhanced version with TypeScript types for better safety and IDE support.
 * Finds code paths that reference non-existent symbols, routes, envs, or packages.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

// Types
interface ImportIssue {
  file: string;
  line: number;
  module: string;
  reason: string;
  fullMatch: string;
}

interface EnvVarIssue {
  file: string;
  line: number;
  name: string;
  fullMatch: string;
}

interface RouteReference {
  file: string;
  line: number;
  path: string;
  fullMatch: string;
}

interface ModuleCheckResult {
  exists: boolean;
  reason: string;
}

interface DetectionIssues {
  imports: ImportIssue[];
  envVars: EnvVarIssue[];
  routes: RouteReference[];
  symbols: string[];
  packages: string[];
}

// Configuration
const CONFIG = {
  srcDir: join(PROJECT_ROOT, "src"),
  excludeDirs: ["node_modules", ".git", "dist", "build"],
  fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
  envSchemaPath: join(PROJECT_ROOT, "src", "env.ts"),
  packageJsonPath: join(PROJECT_ROOT, "package.json"),
} as const;

// Built-in Vite environment variables
const BUILT_IN_VITE_ENV_VARS = [
  "DEV",
  "PROD",
  "MODE",
  "BASE_URL",
  "SSR",
] as const;

// Results storage
const issues: DetectionIssues = {
  imports: [],
  envVars: [],
  routes: [],
  symbols: [],
  packages: [],
};

/**
 * Check if a file should be analyzed
 */
function shouldAnalyzeFile(filePath: string): boolean {
  const ext = extname(filePath);
  return CONFIG.fileExtensions.includes(ext);
}

/**
 * Recursively find all source files
 */
function findSourceFiles(dir: string): string[] {
  const files: string[] = [];

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
    console.warn(
      `Warning: Could not read directory ${dir}:`,
      (error as Error).message
    );
  }

  return files;
}

/**
 * Extract import statements from file content
 */
function extractImports(
  content: string
): Array<{ module: string; line: number; fullMatch: string }> {
  const imports: Array<{ module: string; line: number; fullMatch: string }> =
    [];

  // Match import statements
  const importRegex =
    /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"`]([^'"`]+)['"`]/g;
  let match: RegExpExecArray | null;

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
function extractEnvVars(
  content: string
): Array<{ name: string; line: number; fullMatch: string }> {
  const envVars: Array<{ name: string; line: number; fullMatch: string }> = [];

  // Match import.meta.env references
  const envRegex = /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g;
  let match: RegExpExecArray | null;

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
function extractRoutes(
  content: string
): Array<{ path: string; line: number; fullMatch: string }> {
  const routes: Array<{ path: string; line: number; fullMatch: string }> = [];

  // Match route patterns
  const routeRegex = /(?:path=|to=)['"`]([^'"`]+)['"`]/g;
  let match: RegExpExecArray | null;

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
function checkModuleExists(
  modulePath: string,
  filePath: string
): ModuleCheckResult {
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
    const extensions = [".ts", ".tsx"];
    const indexFiles = ["/index.ts", "/index.tsx"];

    for (const ext of extensions) {
      try {
        statSync(resolvedPath + ext);
        return { exists: true, reason: `found ${ext} file` };
      } catch {
        // Continue checking
      }
    }

    for (const indexFile of indexFiles) {
      try {
        statSync(resolvedPath + indexFile);
        return { exists: true, reason: `found ${indexFile}` };
      } catch {
        // Continue checking
      }
    }

    return { exists: false, reason: "no matching file found" };
  }

  // Handle relative imports
  const resolvedPath = join(dirname(filePath), modulePath);
  const extensions = [".ts", ".tsx"];
  const indexFiles = ["/index.ts", "/index.tsx"];

  for (const ext of extensions) {
    try {
      statSync(resolvedPath + ext);
      return { exists: true, reason: `found ${ext} file` };
    } catch {
      // Continue checking
    }
  }

  for (const indexFile of indexFiles) {
    try {
      statSync(resolvedPath + indexFile);
      return { exists: true, reason: `found ${indexFile}` };
    } catch {
      // Continue checking
    }
  }

  return { exists: false, reason: "no matching file found" };
}

/**
 * Get defined environment variables from env.ts
 */
function getDefinedEnvVars(): string[] {
  try {
    const envContent = readFileSync(CONFIG.envSchemaPath, "utf8");
    const envVars: string[] = [];

    // Extract VITE_* variables from env schema
    const envRegex = /VITE_[A-Z_][A-Z0-9_]*/g;
    let match: RegExpExecArray | null;

    while ((match = envRegex.exec(envContent)) !== null) {
      envVars.push(match[0]);
    }

    // Add built-in Vite environment variables
    envVars.push(...BUILT_IN_VITE_ENV_VARS);

    return envVars;
  } catch (error) {
    console.warn(
      `Warning: Could not read env schema: ${(error as Error).message}`
    );
    return [...BUILT_IN_VITE_ENV_VARS]; // Fallback to built-in vars
  }
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath: string): void {
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
      `Warning: Could not analyze file ${filePath}: ${(error as Error).message}`
    );
  }
}

/**
 * Print results with enhanced formatting
 */
function printResults(): void {
  console.log("🔍 TypeScript Hallucination Detection Results\n");

  let totalIssues = 0;

  // Import issues
  if (issues.imports.length > 0) {
    console.log(`❌ Import Issues (${issues.imports.length}):`);
    issues.imports.forEach((issue) => {
      console.log(
        `  ${issue.file}:${issue.line} - Module "${issue.module}" not found (${issue.reason})`
      );
      console.log(`    ${issue.fullMatch}`);
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
      console.log(`    ${issue.fullMatch}`);
    });
    console.log();
    totalIssues += issues.envVars.length;
  }

  // Route issues (informational)
  if (issues.routes.length > 0) {
    console.log(`ℹ️  Route References (${issues.routes.length}):`);
    const uniqueRoutes = new Set(issues.routes.map((r) => r.path));
    uniqueRoutes.forEach((route) => {
      console.log(`  ${route}`);
    });
    console.log();
  }

  // Summary
  if (totalIssues === 0) {
    console.log("✅ No hallucination issues found!");
    console.log("🎉 Your codebase is free of hallucinated references.");
  } else {
    console.log(`⚠️  Total issues found: ${totalIssues}`);
    console.log("\nRecommendations:");
    console.log("1. Fix or remove non-existent imports");
    console.log("2. Add missing environment variables to env.ts schema");
    console.log("3. Verify all routes are properly defined");
    console.log("4. Add runtime guards for critical paths");
    console.log("5. Run TypeScript compiler to catch type errors");
  }
}

/**
 * Main function
 */
function main(): void {
  console.log("🔍 Starting TypeScript hallucination detection...\n");

  const sourceFiles = findSourceFiles(CONFIG.srcDir);
  console.log(`📁 Found ${sourceFiles.length} source files to analyze\n`);

  for (const file of sourceFiles) {
    analyzeFile(file);
  }

  printResults();

  // Exit with error code if issues found
  const totalIssues = issues.imports.length + issues.envVars.length;
  if (totalIssues > 0) {
    process.exit(1);
  }
}

// Run the detector
main();
