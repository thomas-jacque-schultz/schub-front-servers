import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import prettier from "eslint-config-prettier";

const RESTRICTED_UI_IMPORTS = {
  patterns: [
    {
      group: ["@mui/material", "@mui/material/*", "@mui/icons-material", "@mui/icons-material/*"],
      message:
        "MUI ne s'importe que dans src/design-system/. Utilisez une primitive du design system, " +
        "ou ajoutez-en une (avec sa story) si elle manque.",
    },
  ],
};

export default tseslint.config(
  {
    ignores: ["dist", "storybook-static", "node_modules", "jsconfig.json"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.es2022 },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // La variante TypeScript couvre aussi les import type, que la règle de base laisse passer.
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": ["error", RESTRICTED_UI_IMPORTS],
    },
  },
  {
    files: ["*.config.js", "*.config.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["src/stores/**/*.tsx", ".storybook/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/design-system/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
  {
    files: [".storybook/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
  {
    files: ["**/*.stories.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
  prettier,
);
