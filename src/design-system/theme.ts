import { createTheme } from "@mui/material/styles";
import {
  backdrops,
  darkPalette,
  elevations,
  lightPalette,
  radii,
  spacingUnit,
  typographyTokens,
} from "./tokens";

/**
 * Le thème de l'application, construit **uniquement** à partir des tokens.
 *
 * <p>Deux schémas de couleur dans un seul thème (`colorSchemes`), pas deux thèmes qu'un
 * `ThemeProvider` maison basculerait à la main : MUI 7 génère alors des variables CSS, ce qui
 * évite le scintillement au chargement et permet à `@storybook/addon-themes` de basculer le
 * rendu en changeant un attribut du DOM.</p>
 *
 * <p>`colorSchemeSelector: "data"` fait porter le schéma par `data-mui-color-scheme` sur
 * `<html>` — c'est ce que pilote le bouton de bascule de l'application comme la barre d'outils
 * de Storybook.</p>
 */
export const appTheme = createTheme({
  cssVariables: {
    // Le nom complet de l'attribut, et pas le raccourci "data" : celui-ci produirait des
    // attributs sans valeur (`data-dark`, `data-light`), que ni les sélecteurs de ce fichier ni
    // `@storybook/addon-themes` ne savent viser.
    colorSchemeSelector: "data-mui-color-scheme",
  },
  /**
   * Le schéma servi quand rien n'est encore connu (premier rendu, pas de préférence lisible).
   * C'est ici que « le sombre est le thème par défaut » devient vrai côté CSS.
   */
  defaultColorScheme: "dark",
  colorSchemes: {
    dark: {
      palette: {
        mode: "dark",
        primary: darkPalette.primary,
        secondary: darkPalette.secondary,
        success: darkPalette.success,
        warning: darkPalette.warning,
        error: darkPalette.error,
        info: darkPalette.info,
        background: {
          default: darkPalette.background.default,
          paper: darkPalette.background.paper,
        },
        text: darkPalette.text,
        divider: darkPalette.divider,
      },
    },
    light: {
      palette: {
        mode: "light",
        primary: lightPalette.primary,
        secondary: lightPalette.secondary,
        success: lightPalette.success,
        warning: lightPalette.warning,
        error: lightPalette.error,
        info: lightPalette.info,
        background: {
          default: lightPalette.background.default,
          paper: lightPalette.background.paper,
        },
        text: lightPalette.text,
        divider: lightPalette.divider,
      },
    },
  },
  spacing: spacingUnit,
  shape: {
    borderRadius: radii.md,
  },
  typography: {
    fontFamily: typographyTokens.fontFamily,
    h3: { fontWeight: typographyTokens.weights.heavy, letterSpacing: typographyTokens.letterSpacing.tight },
    h4: { fontWeight: typographyTokens.weights.bold, letterSpacing: typographyTokens.letterSpacing.normal },
    h5: { fontWeight: typographyTokens.weights.bold },
    h6: { fontWeight: typographyTokens.weights.medium },
    overline: { letterSpacing: typographyTokens.letterSpacing.wide, fontWeight: typographyTokens.weights.bold },
    button: { textTransform: "none", fontWeight: typographyTokens.weights.medium },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "html, body, #root": {
          minHeight: "100%",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radii.md,
          border: "1px solid",
          borderColor: theme.vars ? theme.vars.palette.divider : theme.palette.divider,
          backgroundImage: "none",
          boxShadow: elevations.dark.md,
          ...theme.applyStyles("light", {
            boxShadow: elevations.light.md,
          }),
        }),
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: radii.md,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radii.sm,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radii.pill,
          fontWeight: typographyTokens.weights.medium,
        },
      },
    },
  },
});

/**
 * Le dégradé de fond du schéma courant, sous forme de valeur `sx` — c'est ce que consomme
 * `PageBackdrop`. Il est ici et pas dans un écran : c'était précisément le problème à corriger.
 */
export const backdropSx = {
  page: {
    background: backdrops.dark.page,
    "[data-mui-color-scheme='light'] &": {
      background: backdrops.light.page,
    },
  },
  panel: {
    background: backdrops.dark.panel,
    "[data-mui-color-scheme='light'] &": {
      background: backdrops.light.panel,
    },
  },
} as const;

/** Clé de `localStorage` où se mémorise le choix clair/sombre de l'utilisateur. */
export const THEME_MODE_STORAGE_KEY = "schub-color-mode";
