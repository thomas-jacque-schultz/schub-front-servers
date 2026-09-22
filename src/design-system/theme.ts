// Importées ici et non dans les points d'entrée : sans ça, Storybook rend la marque en Arial.
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";

import { createTheme } from "@mui/material/styles";
import {
  backdrops,
  darkPalette,
  elevations,
  lightPalette,
  radii,
  spacingUnit,
  textures,
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
    h4: { fontWeight: typographyTokens.weights.bold, letterSpacing: typographyTokens.letterSpacing.tight },
    h5: { fontWeight: typographyTokens.weights.bold, letterSpacing: typographyTokens.letterSpacing.tight },
    h6: { fontWeight: typographyTokens.weights.medium },
    overline: {
      fontFamily: typographyTokens.monospaceFontFamily,
      letterSpacing: typographyTokens.letterSpacing.wide,
      fontWeight: typographyTokens.weights.medium,
    },
    button: { textTransform: "none", fontWeight: typographyTokens.weights.bold },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "html, body, #root": {
          minHeight: "100%",
        },
        "table, [role='table']": {
          fontVariantNumeric: "tabular-nums",
        },
        "::selection": {
          background: "rgba(164, 71, 126, 0.45)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radii.lg,
          border: "1px solid",
          borderColor: darkPalette.outline,
          backgroundImage: "none",
          boxShadow: elevations.dark.md,
          ...theme.applyStyles("light", {
            borderColor: lightPalette.outline,
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
          borderRadius: radii.sm,
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

const trame = (couleur: string, pas: number) =>
  `repeating-linear-gradient(0deg, ${couleur} 0 1px, transparent 1px ${pas}px), ` +
  `repeating-linear-gradient(90deg, ${couleur} 0 1px, transparent 1px ${pas}px)`;

export const gridOverlaySx = {
  content: '""',
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: trame(textures.dark.grid, textures.dark.gridSize),
  maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 38%)",
  WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 38%)",
  "[data-mui-color-scheme='light'] &": {
    backgroundImage: trame(textures.light.grid, textures.light.gridSize),
  },
} as const;

export const THEME_MODE_STORAGE_KEY = "schub-color-mode";
