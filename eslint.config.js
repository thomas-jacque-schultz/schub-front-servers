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

// L'application League of Legends deviendra une application à part : la frontière se tient dès maintenant.
// Le reste du front n'y entre que par src/lol/index.ts…
const PORTE_DE_LOL = {
  regex: "(^|/)lol/.",
  message:
    "Hors de src/lol/, l'application League of Legends ne s'importe que par son point d'entrée (src/lol/index.ts).",
};

// …et elle n'emprunte au reste que les briques communes, pas ce qui est propre à Schub.
const COMMUN =
  "design-system|i18n|seo|routing|api/(httpClient|useRequest|profileApi)|stores/(authStore|profileStore)|types/(permission|profile)";
const sortieDeLol = (profondeur) => ({
  files: [`src/lol/${"*/".repeat(profondeur - 1)}*.{ts,tsx}`],
  rules: {
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        patterns: [
          MUI_HORS_DESIGN_SYSTEM,
          {
            regex: `^(\\.\\./){${profondeur}}(?!(${COMMUN})(/|$))`,
            message:
              "src/lol/ n'emprunte au reste du front que les briques communes (design system, i18n, seo, routing, " +
              "client HTTP, session, profil). Ce qui est propre à Schub reste hors de sa portée.",
          },
        ],
      },
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
        { patterns: [MUI_HORS_DESIGN_SYSTEM, PORTE_DE_LOL] },
      ],
    },
  },
  ...[1, 2, 3, 4].map(sortieDeLol),
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
