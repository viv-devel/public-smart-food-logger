// https://github.com/francoismassart/eslint-plugin-tailwindcss/pull/381
// import eslintPluginTailwindcss from "eslint-plugin-tailwindcss"
import eslintPluginNext from "@next/eslint-plugin-next";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vitest from "eslint-plugin-vitest";

// ========================================
// Common configurations
// ========================================

const eslintIgnore = [
  ".git/",
  "node_modules/",
  "*.min.js",
  "*.config.js",
  "*.d.ts",
  "**/dist/",
  "**/build/",
  "**/coverage/",
  "frontend/.next/",
  "frontend/out/",
  "frontend/test/results/",
  "frontend/.playwright/",
  "frontend/playwright-report/",
  "frontend/test-results/",
  "backend/test/__mocks__/",
];

const commonPlugins = {
  "@typescript-eslint": typescriptEslint,
  "simple-import-sort": simpleImportSort,
};

const commonRules = {
  "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  "simple-import-sort/imports": "error",
  "simple-import-sort/exports": "error",
};

const vitestRules = {
  ...vitest.configs.recommended.rules,
  "vitest/no-commented-out-tests": "off",
};

// ========================================
// Helper functions
// ========================================

/**
 * Create TypeScript configuration for a package
 * @param {string} packageName - Name of the package (e.g., "backend", "frontend", "shared")
 * @param {string} filePattern - File pattern (e.g., "**\/*.ts", "**\/*.{ts,tsx}")
 * @param {object} additionalPlugins - Additional plugins to include
 * @param {object} additionalRules - Additional rules to include
 */
function createTypeScriptConfig(
  packageName,
  filePattern,
  additionalPlugins = {},
  additionalRules = {},
) {
  return {
    files: [`${packageName}/src/${filePattern}`],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: `./${packageName}/tsconfig.json`,
      },
    },
    plugins: {
      ...commonPlugins,
      ...additionalPlugins,
    },
    rules: {
      ...commonRules,
      ...additionalRules,
    },
  };
}

/**
 * Create Vitest test configuration for a package
 * @param {string} packageName - Name of the package (e.g., "backend", "shared")
 */
function createVitestConfig(packageName) {
  return {
    files: [`${packageName}/test/**/*.test.ts`],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: null, // Don't require tsconfig for test files
      },
    },
    plugins: {
      vitest: vitest,
    },
    rules: vitestRules,
  };
}

// ========================================
// ESLint configuration
// ========================================

const config = [
  // Global ignores
  {
    ignores: eslintIgnore,
  },

  //  https://github.com/francoismassart/eslint-plugin-tailwindcss/pull/381
  // ...eslintPluginTailwindcss.configs["flat/recommended"],
  // typescriptEslint.configs.recommended,

  // Import plugin configuration (applies to all files)
  // eslintPluginImport.flatConfigs.recommended,

  // ========================================
  // Backend configuration
  // ========================================
  createTypeScriptConfig("backend", "**/*.ts"),
  createVitestConfig("backend"),

  // ========================================
  // Frontend configuration
  // ========================================
  createTypeScriptConfig(
    "frontend",
    "**/*.{ts,tsx}",
    { "@next/next": eslintPluginNext },
    {
      // ...eslintPluginNext.configs.recommended.rules,
      // ...eslintPluginNext.configs["core-web-vitals"].rules,
      "@next/next/no-html-link-for-pages": "off",
    },
  ),

  // ========================================
  // Shared package configuration
  // ========================================
  createTypeScriptConfig("shared", "**/*.ts"),
  createVitestConfig("shared"),

  // ========================================
  // Common configuration (commented for future use)
  // ========================================

  // Shared settings for import resolution and Tailwind
  {
    plugins: {
      import: eslintPluginImport,
    },
    settings: {
      tailwindcss: {
        callees: ["classnames", "clsx", "ctl", "cn", "cva"],
      },

      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // Disabled because we use simple-import-sort plugin
      // "sort-imports": [
      //   "error",
      //   {
      //     ignoreCase: true,
      //     ignoreDeclarationSort: true,
      //   },
      // ],
      // "import/order": [
      //   "warn",
      //   {
      //     groups: [
      //       "external",
      //       "builtin",
      //       "internal",
      //       "sibling",
      //       "parent",
      //       "index",
      //     ],
      //     pathGroups: [
      //       ...getDirectoriesToSort().map((singleDir) => ({
      //         pattern: `${singleDir}/**`,
      //         group: "internal",
      //       })),
      //       {
      //         pattern: "env",
      //         group: "internal",
      //       },
      //       {
      //         pattern: "theme",
      //         group: "internal",
      //       },
      //       {
      //         pattern: "public/**",
      //         group: "internal",
      //         position: "after",
      //       },
      //     ],
      //     pathGroupsExcludedImportTypes: ["internal"],
      //     alphabetize: {
      //       order: "asc",
      //       caseInsensitive: true,
      //     },
      //   },
      // ],
    },
  },

  // Prettier configuration (must be last)
  prettierConfig,
];

// Commented out for future use with import/order
// function getDirectoriesToSort() {
//   const ignoredSortingDirectories = [
//     ".git",
//     ".next",
//     ".vscode",
//     "node_modules",
//   ];
//   return readdirSync(process.cwd())
//     .filter((file) => statSync(process.cwd() + "/" + file).isDirectory())
//     .filter((f) => !ignoredSortingDirectories.includes(f));
// }

export default config;
