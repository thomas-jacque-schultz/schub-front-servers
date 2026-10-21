import fs from "node:fs";
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

// Quatre zones, un pacte (src/common/index.ts). Schub, PremadeLab et les mini-jeux n'entrent dans common que par
// sa porte d'entrée et ne s'importent jamais l'un l'autre ; common n'importe aucun d'eux. Un jeu n'importe
// pas non plus un autre jeu : il n'a en commun avec eux que games/commun.
const PORTE_DE_COMMON = {
  regex: "(^|/)common/.",
  message: "src/common ne s'importe que par sa porte d'entrée (src/common/index.ts) : c'est le pacte.",
};
const vers = (zone) => ({
  regex: `(^|/)${zone}(/|$)`,
  message: `Chaque application reste chez elle : ${zone} ne s'importe pas d'ici.`,
});
const JEUX = fs
  .readdirSync(new URL("./src/games", import.meta.url), { withFileTypes: true })
  .filter((entree) => entree.isDirectory() && entree.name !== "commun")
  .map((entree) => entree.name);
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
    ignores: ["dist", "dist-ssr", "storybook-static", "node_modules", "jsconfig.json", "src/common/api/contrat.ts"],
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
  pacte(["src/schub/**/*.{ts,tsx}"], [PORTE_DE_COMMON, vers("premadelab"), vers("games")]),
  pacte(["src/premadelab/**/*.{ts,tsx}"], [PORTE_DE_COMMON, vers("schub"), vers("games")]),
  pacte(["src/common/**/*.{ts,tsx}"], [vers("schub"), vers("premadelab"), vers("games")]),
  pacte(["src/games/commun/**/*.{ts,tsx}"], [PORTE_DE_COMMON, vers("schub"), vers("premadelab"), ...JEUX.map(vers)]),
  ...JEUX.map((jeu) =>
    pacte(
      [`src/games/${jeu}/**/*.{ts,tsx}`],
      [PORTE_DE_COMMON, vers("schub"), vers("premadelab"), ...JEUX.filter((autre) => autre !== jeu).map(vers)],
    ),
  ),
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
