import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import prettier from "eslint-config-prettier";

/**
 * Les modules qu'un écran n'a pas le droit d'importer directement.
 *
 * <p>C'est **le** livrable du chantier design system. Un Storybook ne force rien : il documente.
 * Ce qui force, c'est que `src/design-system/` soit la seule porte vers MUI, et qu'un import
 * direct fasse échouer le lint. Sans cette règle, la consigne est contournée en trois semaines,
 * par n'importe qui, y compris de bonne foi.</p>
 */
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

/**
 * ⚠️ DETTE À RÉSORBER — la liste doit se vider, pas grandir.
 *
 * <p>Ces fichiers existaient avant le design system et importent MUI directement. Chaque écran
 * migré vers les primitives (lot B.5) **retire sa ligne d'ici**. Une liste qui rétrécit est un
 * plan ; une règle désactivée est un abandon.</p>
 *
 * <p>Au 20-09, il n'en reste qu'un. `AllServersComponent`, `DiscordChannelsCard` et
 * `PortForwardingCard` sont sortis avec le chantier C : les primitives qui leur manquaient —
 * `Icon`, `Tooltip`, `Chip`, `IconButton`, `Spinner`, `Divider`, `Disclosure` — ont été ajoutées
 * au design system plutôt que de reconduire la dérogation.</p>
 *
 * <p>`Login.tsx` reste ici pour une raison de coordination, pas de technique : la PR de la
 * connexion Discord le réécrit entièrement **et retire déjà cette ligne**. Le migrer en
 * parallèle produirait un conflit sur un fichier que deux branches réécrivent au même moment.
 * Le bloc est donc vide à la fusion des deux PR, et cette constante disparaît avec sa dernière
 * ligne.</p>
 */
// Vide depuis le 2026-09-21 : les trois écrans restants sont sortis au lot B.5, et Login.tsx
// a été réécrit par le lot A.3. Le chantier B est clos — cette liste ne doit plus jamais
// grossir : un écran qui a besoin de MUI a besoin d'une primitive, pas d'une dérogation.
const DESIGN_SYSTEM_DEBT = [];

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
      // La variante TypeScript couvre aussi les `import type`, que la règle de base laisse passer.
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": ["error", RESTRICTED_UI_IMPORTS],
    },
  },
  {
    // Fichiers de configuration exécutés par Node, pas par le navigateur.
    files: ["*.config.js", "*.config.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Un store exporte son fournisseur et son hook : c est sa raison d etre, pas un oubli.
    files: ["src/stores/**/*.tsx", ".storybook/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // La porte. C est le seul endroit du dépôt où MUI s importe.
    files: ["src/design-system/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
  {
    // Storybook est un consommateur légitime : ses fichiers de configuration montent le thème.
    files: [".storybook/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
  {
    // Les stories montrent les primitives en situation : elles ont le droit de poser une mise
    // en page autour, sans que cela ouvre la porte aux écrans.
    files: ["**/*.stories.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    name: "dette à résorber — imports MUI hors design system",
    files: DESIGN_SYSTEM_DEBT,
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
  prettier,
);
