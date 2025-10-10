# Hallucination Detection System

This document describes the hallucination detection system implemented to find and prevent code paths that reference non-existent symbols, routes, environments, or packages.

## Overview

The hallucination detection system helps identify "hallucinated" code - code that references resources that don't actually exist in the codebase. This is particularly useful for:

- Catching references to deleted files or components
- Ensuring all environment variables are properly defined
- Validating import statements
- Detecting broken routes or API endpoints

## Components

### 1. Runtime Guards

Runtime guards have been added to critical paths to catch issues at runtime:

#### Environment Variables

```typescript
// In forge-layer-sdk.ts and api.ts
const FORGE_LAYER_URL =
  import.meta.env.VITE_FORGE_LAYER_URL || "https://forge-layer.onrender.com";

// Runtime guard to ensure URL is valid
if (
  typeof FORGE_LAYER_URL !== "string" ||
  !FORGE_LAYER_URL.startsWith("http")
) {
  throw new Error(
    `Invalid FORGE_LAYER_URL: ${FORGE_LAYER_URL}. Expected a valid HTTP/HTTPS URL.`
  );
}
```

#### DOM Elements

```typescript
// In main.tsx
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "Critical error: #root element not found in DOM. Cannot mount React application."
  );
}
```

### 2. Environment Schema Validation

The `src/env.ts` file has been updated to include all environment variables used in the codebase:

```typescript
// Added missing environment variable
VITE_FORGE_LAYER_URL: z.string().url().optional(),
```

### 3. Hallucination Detection Scripts

Two detection scripts are available:

#### JavaScript Version (`scripts/hallucination-detector.js`)

- Lightweight, no dependencies
- Basic detection capabilities
- Good for CI/CD pipelines

#### TypeScript Version (`scripts/hallucination-detector.ts`)

- Enhanced type safety
- Better IDE support
- More detailed error reporting

## Usage

### Running the Detector

```bash
# JavaScript version (recommended for CI)
pnpm hallucination-check

# TypeScript version (recommended for development)
pnpm hallucination-check:ts
```

### What It Checks

1. **Import Statements**: Verifies all import paths resolve to existing files
2. **Environment Variables**: Ensures all `import.meta.env.*` references are defined in the env schema
3. **Routes**: Lists all route references for manual verification
4. **External Packages**: Validates package.json dependencies

### Output Example

```
🔍 Hallucination Detection Results

✅ No hallucination issues found!
🎉 Your codebase is free of hallucinated references.
```

Or when issues are found:

```
❌ Import Issues (2):
  /src/components/MyComponent.tsx:5 - Module "@/lib/non-existent" not found (no matching file found)
    import { something } from "@/lib/non-existent";

❌ Environment Variable Issues (1):
  /src/lib/api.ts:10 - Environment variable "VITE_MISSING_VAR" not defined in env schema
    import.meta.env.VITE_MISSING_VAR
```

## Integration with CI/CD

The hallucination check has been integrated into the CI pipeline:

```json
{
  "scripts": {
    "ci": "pnpm build && pnpm test:ci && pnpm test:a11y:ci && pnpm size-limit && pnpm lighthouse && pnpm hallucination-check"
  }
}
```

## Configuration

The detector can be configured by modifying the `CONFIG` object in the script:

```javascript
const CONFIG = {
  srcDir: join(PROJECT_ROOT, "src"),
  excludeDirs: ["node_modules", ".git", "dist", "build"],
  fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
  envSchemaPath: join(PROJECT_ROOT, "src", "env.ts"),
  packageJsonPath: join(PROJECT_ROOT, "package.json"),
};
```

## Best Practices

1. **Run Regularly**: Include the check in your development workflow
2. **Fix Immediately**: Address any issues found to prevent accumulation
3. **Update Schema**: Add new environment variables to `env.ts` as you use them
4. **Validate Routes**: Manually verify route references make sense
5. **Use Runtime Guards**: Add guards for critical paths that could fail at runtime

## Troubleshooting

### Common Issues

1. **"Module not found" errors**: Check file paths and ensure files exist
2. **"Environment variable not defined"**: Add the variable to `src/env.ts`
3. **False positives**: Update the detector configuration if needed

### Adding New Environment Variables

When adding a new environment variable:

1. Add it to `src/env.ts` schema:

   ```typescript
   VITE_MY_NEW_VAR: z.string().optional(),
   ```

2. Use it in your code:

   ```typescript
   const myVar = import.meta.env.VITE_MY_NEW_VAR;
   ```

3. Run the detector to verify:
   ```bash
   pnpm hallucination-check
   ```

## Future Enhancements

Potential improvements to the detection system:

1. **Symbol Resolution**: Check if imported symbols actually exist in the target files
2. **API Endpoint Validation**: Verify API endpoints are reachable
3. **Route Validation**: Check if route components actually exist
4. **Type Checking**: Integration with TypeScript compiler for more comprehensive checks
5. **Performance Optimization**: Caching and incremental checking for large codebases

## Contributing

To improve the hallucination detection system:

1. Add new detection patterns to the scripts
2. Enhance error reporting and suggestions
3. Add support for new file types or frameworks
4. Improve performance and accuracy

The system is designed to be extensible and can be adapted to specific project needs.
