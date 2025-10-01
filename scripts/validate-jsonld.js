#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * JSON-LD Schema Validation Script
 * Validates JSON-LD files against Schema.org requirements
 */

const ARTIFACTS_DIR = path.join(__dirname, "..", "artifacts", "seo");
const VALIDATION_OUTPUT = path.join(ARTIFACTS_DIR, "validation.txt");

// Required fields for SoftwareApplication schema
const REQUIRED_FIELDS = ["@context", "@type", "name", "description", "url"];

// Valid @type values for our use case
const VALID_TYPES = [
  "SoftwareApplication",
  "WebApplication",
  "MobileApplication",
];

// Valid application categories
const VALID_CATEGORIES = [
  "MultimediaApplication",
  "BusinessApplication",
  "GameApplication",
  "SocialNetworkingApplication",
  "WebApplication",
];

/**
 * Validate a single JSON-LD object
 */
function validateJsonLd(jsonLd, filename) {
  const errors = [];
  const warnings = [];

  // Check if it's a valid JSON object
  if (typeof jsonLd !== "object" || jsonLd === null) {
    errors.push(`${filename}: Invalid JSON-LD - must be an object`);
    return { errors, warnings };
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in jsonLd)) {
      errors.push(`${filename}: Missing required field '${field}'`);
    }
  }

  // Validate @context
  if (jsonLd["@context"] && jsonLd["@context"] !== "https://schema.org") {
    errors.push(`${filename}: Invalid @context - must be 'https://schema.org'`);
  }

  // Validate @type
  if (jsonLd["@type"] && !VALID_TYPES.includes(jsonLd["@type"])) {
    errors.push(
      `${filename}: Invalid @type '${
        jsonLd["@type"]
      }' - must be one of: ${VALID_TYPES.join(", ")}`
    );
  }

  // Validate applicationCategory
  if (
    jsonLd.applicationCategory &&
    !VALID_CATEGORIES.includes(jsonLd.applicationCategory)
  ) {
    warnings.push(
      `${filename}: Unusual applicationCategory '${
        jsonLd.applicationCategory
      }' - consider using: ${VALID_CATEGORIES.join(", ")}`
    );
  }

  // Validate offers structure
  if (jsonLd.offers) {
    if (typeof jsonLd.offers !== "object") {
      errors.push(`${filename}: 'offers' must be an object`);
    } else {
      if (jsonLd.offers["@type"] !== "Offer") {
        errors.push(`${filename}: offers.@type must be 'Offer'`);
      }
      if (!jsonLd.offers.price) {
        errors.push(`${filename}: offers.price is required`);
      }
      if (!jsonLd.offers.priceCurrency) {
        errors.push(`${filename}: offers.priceCurrency is required`);
      }
    }
  }

  // Validate creator structure
  if (jsonLd.creator) {
    if (typeof jsonLd.creator !== "object") {
      errors.push(`${filename}: 'creator' must be an object`);
    } else {
      if (jsonLd.creator["@type"] !== "Organization") {
        errors.push(`${filename}: creator.@type must be 'Organization'`);
      }
      if (!jsonLd.creator.name) {
        errors.push(`${filename}: creator.name is required`);
      }
    }
  }

  // Validate featureList
  if (jsonLd.featureList && !Array.isArray(jsonLd.featureList)) {
    errors.push(`${filename}: 'featureList' must be an array`);
  }

  // Check for common issues
  if (jsonLd.name && typeof jsonLd.name !== "string") {
    errors.push(`${filename}: 'name' must be a string`);
  }

  if (jsonLd.description && typeof jsonLd.description !== "string") {
    errors.push(`${filename}: 'description' must be a string`);
  }

  if (jsonLd.url && typeof jsonLd.url !== "string") {
    errors.push(`${filename}: 'url' must be a string`);
  }

  // Check for valid URLs
  if (jsonLd.url && !isValidUrl(jsonLd.url)) {
    warnings.push(`${filename}: 'url' appears to be invalid: ${jsonLd.url}`);
  }

  if (jsonLd.screenshot && !isValidUrl(jsonLd.screenshot)) {
    warnings.push(
      `${filename}: 'screenshot' appears to be invalid: ${jsonLd.screenshot}`
    );
  }

  return { errors, warnings };
}

/**
 * Simple URL validation
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Main validation function
 */
function validateAllJsonLdFiles() {
  console.log("🔍 Starting JSON-LD validation...\n");

  const files = fs
    .readdirSync(ARTIFACTS_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.log("❌ No JSON files found in artifacts/seo/");
    return;
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  for (const file of files) {
    const filePath = path.join(ARTIFACTS_DIR, file);
    console.log(`📄 Validating ${file}...`);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const jsonLd = JSON.parse(content);

      const { errors, warnings } = validateJsonLd(jsonLd, file);

      totalErrors += errors.length;
      totalWarnings += warnings.length;

      if (errors.length === 0 && warnings.length === 0) {
        console.log(`  ✅ ${file} - No issues found`);
      } else {
        if (errors.length > 0) {
          console.log(`  ❌ ${file} - ${errors.length} error(s):`);
          errors.forEach((error) => console.log(`    - ${error}`));
        }
        if (warnings.length > 0) {
          console.log(`  ⚠️  ${file} - ${warnings.length} warning(s):`);
          warnings.forEach((warning) => console.log(`    - ${warning}`));
        }
      }

      results.push({
        file,
        errors,
        warnings,
        valid: errors.length === 0,
      });
    } catch (error) {
      console.log(`  ❌ ${file} - Parse error: ${error.message}`);
      totalErrors++;
      results.push({
        file,
        errors: [`Parse error: ${error.message}`],
        warnings: [],
        valid: false,
      });
    }
  }

  // Generate validation report
  const report = generateValidationReport(results, totalErrors, totalWarnings);

  // Save validation results
  fs.writeFileSync(VALIDATION_OUTPUT, report);
  console.log(`\n📝 Validation report saved to: ${VALIDATION_OUTPUT}`);

  // Summary
  console.log("\n📊 Validation Summary:");
  console.log(`  Files processed: ${files.length}`);
  console.log(`  Total errors: ${totalErrors}`);
  console.log(`  Total warnings: ${totalWarnings}`);
  console.log(
    `  Valid files: ${results.filter((r) => r.valid).length}/${files.length}`
  );

  if (totalErrors === 0) {
    console.log("\n🎉 All JSON-LD files are valid! No schema errors found.");
    process.exit(0);
  } else {
    console.log("\n❌ Validation failed. Please fix the errors above.");
    process.exit(1);
  }
}

/**
 * Generate detailed validation report
 */
function generateValidationReport(results, totalErrors, totalWarnings) {
  const timestamp = new Date().toISOString();

  let report = `JSON-LD Validation Report
Generated: ${timestamp}
========================================

Summary:
- Files processed: ${results.length}
- Total errors: ${totalErrors}
- Total warnings: ${totalWarnings}
- Valid files: ${results.filter((r) => r.valid).length}/${results.length}

`;

  for (const result of results) {
    report += `\nFile: ${result.file}
Status: ${result.valid ? "✅ VALID" : "❌ INVALID"}
Errors: ${result.errors.length}
Warnings: ${result.warnings.length}

`;

    if (result.errors.length > 0) {
      report += "Errors:\n";
      result.errors.forEach((error) => {
        report += `  - ${error}\n`;
      });
      report += "\n";
    }

    if (result.warnings.length > 0) {
      report += "Warnings:\n";
      result.warnings.forEach((warning) => {
        report += `  - ${warning}\n`;
      });
      report += "\n";
    }

    report += "---\n";
  }

  if (totalErrors === 0) {
    report +=
      "\n🎉 All JSON-LD files passed validation! No schema errors found.\n";
  } else {
    report += `\n❌ Validation failed with ${totalErrors} error(s). Please review and fix the issues above.\n`;
  }

  return report;
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateAllJsonLdFiles();
}

module.exports = { validateJsonLd, validateAllJsonLdFiles };
