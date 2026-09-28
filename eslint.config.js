import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import prettier from "eslint-config-prettier";

const MUI_HORS_DESIGN_SYSTEM = {
  group: [
    "@mui/material",
    "@mui/material/*",
    "@mui/icons-material",
    "@mui/icons-material/*",
  ],
  message:
    "MUI ne s'importe que dans src/design-system/. Utilisez une primitive du design system, " +
    "ou ajoutez-en une (avec sa story) si elle manque.",
};

// Trois zones, un pacte (src/common/index.ts). Schub et PremadeLab n'entrent dans common que par
// sa porte d'entrée, ne s'importent jamais l'un l'autre, et common n'importe ni l'un ni l'autre.
const PORTE_DE_COMMON = {
  regex: "(^|/)common/.",
  message: "src/common ne s'importe que par sa porte d'entrée (src/common/index.ts) : c'est le pacte.",
};
const vers = (zone) => ({
  regex: `(^|/)${zone}(/|$)`,
  message: `Schub et PremadeLab sont deux applications : ${zone} ne s'importe pas d'ici.`,
});
const pacte = (fichiers, motifs) => ({
  files: fichiers,
  rules: {
    "@typescript-eslint/no-restricted-imports": [
      "error",
      { patterns: [MUI_HORS_DESIGN_SYSTEM, ...motifs] },
    ],
  },
});

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
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // La variante TypeScript couvre aussi les import type, que la règle de base laisse passer.
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        { patterns: [MUI_HORS_DESIGN_SYSTEM] },
      ],
    },
  },
  pacte(["src/schub/**/*.{ts,tsx}"], [PORTE_DE_COMMON, vers("premadelab")]),
  pacte(["src/premadelab/**/*.{ts,tsx}"], [PORTE_DE_COMMON, vers("schub")]),
  pacte(["src/common/**/*.{ts,tsx}"], [vers("schub"), vers("premadelab")]),
  {
    files: ["*.config.js", "*.config.ts", "scripts/**/*.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["src/**/stores/**/*.tsx", "src/common/product.tsx", ".storybook/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/common/design-system/**/*.{ts,tsx}"],
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
