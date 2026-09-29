// Importées ici et non dans les points d'entrée : sans ça, Storybook rend la marque en Arial.
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";

import { createTheme } from "@mui/material/styles";
import {
  identity,
  radii,
  spacingUnit,
  typographyTokens,
  type Identity,
} from "./tokens";

export const createAppTheme = (identity: Identity) => {
  const darkPalette = identity.palettes.dark;
  const lightPalette = identity.palettes.light;
  const elevations = identity.elevations;

  return createTheme({
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
      h3: {
        fontWeight: typographyTokens.weights.heavy,
        letterSpacing: typographyTokens.letterSpacing.tight,
      },
      h4: {
        fontWeight: typographyTokens.weights.bold,
        letterSpacing: typographyTokens.letterSpacing.tight,
      },
      h5: {
        fontWeight: typographyTokens.weights.bold,
        letterSpacing: typographyTokens.letterSpacing.tight,
      },
      h6: { fontWeight: typographyTokens.weights.medium },
      overline: {
        fontFamily: typographyTokens.monospaceFontFamily,
        letterSpacing: typographyTokens.letterSpacing.wide,
        fontWeight: typographyTokens.weights.medium,
      },
      button: {
        textTransform: "none",
        fontWeight: typographyTokens.weights.bold,
      },
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
            background: identity.selection,
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
};

export const appTheme = createAppTheme(identity);

export const backdropSxOf = ({ backdrops }: Identity) =>
  ({
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
  }) as const;

export const backdropSx = backdropSxOf(identity);

const trame = (couleur: string, pas: number) =>
  `repeating-linear-gradient(0deg, ${couleur} 0 1px, transparent 1px ${pas}px), ` +
  `repeating-linear-gradient(90deg, ${couleur} 0 1px, transparent 1px ${pas}px)`;

export const gridOverlaySxOf = ({ textures }: Identity) =>
  ({
    content: '""',
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: trame(textures.dark.grid, textures.dark.gridSize),
    maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 38%)",
    WebkitMaskImage:
      "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 38%)",
    "[data-mui-color-scheme='light'] &": {
      backgroundImage: trame(textures.light.grid, textures.light.gridSize),
    },
  }) as const;

export const gridOverlaySx = gridOverlaySxOf(identity);

export const THEME_MODE_STORAGE_KEY = "color-mode";
const ANCIENNE_CLE = "schub-color-mode";

// Reprend le choix enregistré sous l'ancienne clé, citée par /privacy et visible sur PremadeLab.
export function migrateThemeModeKey(
  storage: Storage | undefined = globalThis.localStorage,
): void {
  try {
    const ancien = storage?.getItem(ANCIENNE_CLE);
    if (ancien && !storage?.getItem(THEME_MODE_STORAGE_KEY)) {
      storage?.setItem(THEME_MODE_STORAGE_KEY, ancien);
    }
    storage?.removeItem(ANCIENNE_CLE);
  } catch {
    // Stockage refusé (navigation privée) : le thème par défaut s'applique.
  }
}
