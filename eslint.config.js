import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
        ...globals.serviceworker,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      prettier: prettier,
      import: importPlugin,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...prettierConfig.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-undef": "off", // TypeScript handles this
      "no-case-declarations": "off", // Allow const declarations in case blocks
      "prettier/prettier": "error",
      // "import/no-unused-modules": [
      //   "error",
      //   {
      //     unusedExports: true,
      //     ignoreExports: ["*.config.*", "*.d.ts"],
      //   },
      // ],
    },
  },
  {
    files: ["**/*.mjs", "scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
