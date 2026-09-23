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

export const appTheme = createTheme({
  cssVariables: {
    // Nom complet de l'attribut : le raccourci "data" produit data-dark/data-light, que ni ce fichier ni addon-themes ne visent.
    colorSchemeSelector: "data-mui-color-scheme",
  },
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

export const THEME_MODE_STORAGE_KEY = "schub-color-mode";
