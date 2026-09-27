export type ColorSchemeName = "light" | "dark";

export type ServerStatusToken =
  "online" | "offline" | "unknown" | "unreachable";

export const brand = {
  prune: "#6B2853",
  pruneBright: "#A4477E",
  pruneDeep: "#3A1230",
  pruneInk: "#1C0A18",
  gold: "#C9A227",
  goldBright: "#E9C766",
  goldDeep: "#8A6B12",
  obsidian: "#0A060C",
} as const;

export interface PaletteTokens {
  primary: { main: string; light: string; dark: string; contrastText: string };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  success: { main: string; contrastText: string };
  warning: { main: string; contrastText: string };
  error: { main: string; contrastText: string };
  info: { main: string; contrastText: string };
  background: { default: string; paper: string; raised: string };
  text: { primary: string; secondary: string; disabled: string };
  divider: string;
  outline: string;
}

export const darkPalette: PaletteTokens = {
  primary: {
    main: brand.gold,
    light: brand.goldBright,
    dark: brand.goldDeep,
    contrastText: "#140C02",
  },
  secondary: {
    main: brand.pruneBright,
    light: "#C36BA0",
    dark: brand.prune,
    contrastText: "#FDF2F8",
  },
  success: { main: "#4FB783", contrastText: "#04120B" },
  warning: { main: "#E2803C", contrastText: "#1A0C04" },
  error: { main: "#E0576B", contrastText: "#1A050A" },
  info: { main: "#5B9BE8", contrastText: "#04101D" },
  background: {
    default: brand.obsidian,
    paper: "#150D18",
    raised: "#1F1426",
  },
  text: {
    primary: "#F2E9EE",
    secondary: "#B6A3B4",
    disabled: "#7A6A7C",
  },
  divider: "rgba(182, 163, 180, 0.20)",
  outline: "rgba(201, 162, 39, 0.14)",
};

export const lightPalette: PaletteTokens = {
  primary: {
    main: brand.prune,
    light: "#8E3F72",
    dark: "#47163A",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: brand.goldDeep,
    light: "#A9861F",
    dark: "#5E480A",
    contrastText: "#FFFFFF",
  },
  success: { main: "#1F7A50", contrastText: "#FFFFFF" },
  warning: { main: "#9A5312", contrastText: "#FFFFFF" },
  error: { main: "#B02A3C", contrastText: "#FFFFFF" },
  info: { main: "#1F5FA9", contrastText: "#FFFFFF" },
  background: {
    default: "#F5F0F2",
    paper: "#FFFFFF",
    raised: "#FAF6F8",
  },
  text: {
    primary: brand.pruneInk,
    secondary: "#584A55",
    disabled: "#8E7F8B",
  },
  divider: "#E2D6DE",
  outline: "#EDE2E8",
};

export const palettes: Record<ColorSchemeName, PaletteTokens> = {
  dark: darkPalette,
  light: lightPalette,
};

export const backdrops: Record<
  ColorSchemeName,
  { page: string; panel: string }
> = {
  dark: {
    page:
      "radial-gradient(1100px 620px at 8% -14%, rgba(164, 71, 126, 0.30) 0%, transparent 62%), " +
      "radial-gradient(900px 540px at 108% 112%, rgba(107, 40, 83, 0.36) 0%, transparent 58%), " +
      brand.obsidian,
    panel: `linear-gradient(180deg, ${brand.obsidian} 0%, #140A16 100%)`,
  },
  light: {
    page:
      "radial-gradient(1100px 620px at 8% -14%, rgba(164, 71, 126, 0.12) 0%, transparent 62%), " +
      "radial-gradient(900px 540px at 108% 112%, rgba(201, 162, 39, 0.14) 0%, transparent 58%), " +
      "#F5F0F2",
    panel: "linear-gradient(180deg, #FAF6F8 0%, #F1E9EE 100%)",
  },
};

export const textures: Record<
  ColorSchemeName,
  { grid: string; gridSize: number }
> = {
  dark: { grid: "rgba(201, 162, 39, 0.055)", gridSize: 32 },
  light: { grid: "rgba(107, 40, 83, 0.055)", gridSize: 32 },
};

export const statusColors: Record<
  ColorSchemeName,
  Record<ServerStatusToken, string>
> = {
  dark: {
    online: darkPalette.success.main,
    offline: "#6E6076",
    unknown: darkPalette.warning.main,
    unreachable: darkPalette.error.main,
  },
  light: {
    online: lightPalette.success.main,
    offline: "#7A6B78",
    unknown: lightPalette.warning.main,
    unreachable: lightPalette.error.main,
  },
};

export const spacingUnit = 8;

export const radii = {
  sm: 2,
  md: 4,
  lg: 8,
  pill: 999,
} as const;

export const elevations: Record<
  ColorSchemeName,
  { sm: string; md: string; lg: string }
> = {
  dark: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.6)",
    md: "0 10px 30px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(233, 199, 102, 0.07)",
    lg: "0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(233, 199, 102, 0.10)",
  },
  light: {
    sm: "0 1px 2px rgba(28, 10, 24, 0.06)",
    md: "0 6px 16px rgba(28, 10, 24, 0.08)",
    lg: "0 18px 40px rgba(28, 10, 24, 0.12)",
  },
};

export const typographyTokens = {
  fontFamily:
    "'Space Grotesk Variable', 'Space Grotesk', 'Segoe UI', 'Noto Sans', Arial, sans-serif",
  monospaceFontFamily:
    "'JetBrains Mono Variable', 'JetBrains Mono', 'Fira Mono', 'Consolas', monospace",
  weights: {
    regular: 400,
    medium: 600,
    bold: 700,
    heavy: 800,
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.14em",
  },
} as const;

export const motion = {
  fast: 120,
  normal: 200,
  slow: 320,
} as const;

export const chartColors: Record<
  ColorSchemeName,
  {
    mark: string;
    markSoft: string;
    // Seconde série : validée avec mark (ΔE deutan 17,7 sombre, 14,3 clair), et toujours en pointillés.
    markSecondary: string;
    markMuted: string;
    track: string;
    grid: string;
    positive: string;
    negative: string;
  }
> = {
  dark: {
    mark: brand.gold,
    markSoft: "rgba(201, 162, 39, 0.26)",
    markSecondary: "#C07AA6",
    markMuted: "rgba(182, 163, 180, 0.55)",
    track: "rgba(182, 163, 180, 0.14)",
    grid: darkPalette.outline,
    positive: darkPalette.success.main,
    negative: darkPalette.error.main,
  },
  light: {
    mark: brand.goldDeep,
    markSoft: "rgba(138, 107, 18, 0.20)",
    markSecondary: "#8E3E6F",
    markMuted: "rgba(28, 10, 24, 0.40)",
    track: "rgba(28, 10, 24, 0.10)",
    grid: lightPalette.outline,
    positive: lightPalette.success.main,
    negative: lightPalette.error.main,
  },
};

// ---------------------------------------------------------------------------------------------
// Les identités : Schub (prune, or, noir) et PremadeLab. Le reste du design system (polices,
// rayons, espacements) est commun : seules les couleurs changent d'une application à l'autre.
// ---------------------------------------------------------------------------------------------

export type AppBrand = "schub" | "premadelab";

export interface Identity {
  palettes: Record<ColorSchemeName, PaletteTokens>;
  backdrops: Record<ColorSchemeName, { page: string; panel: string }>;
  textures: Record<ColorSchemeName, { grid: string; gridSize: number }>;
  chart: typeof chartColors;
  status: typeof statusColors;
  elevations: typeof elevations;
  selection: string;
}

// PremadeLab : encre de nuit, menthe et corail. Rien de l'or de Schub, ni du doré et du bleu de
// Riot. Contrastes mesurés (WCAG) : menthe sur fond 10,7:1, texte de bouton sur menthe 10,4:1,
// sarcelle sur blanc 6,4:1, corail foncé sur blanc 5,6:1.
export const premadelabBrand = {
  mint: "#3DD6B5",
  mintBright: "#7BE8D0",
  mintDeep: "#1F9E84",
  teal: "#0E6B5B",
  coral: "#FF7A59",
  coralDeep: "#B4432A",
  night: "#080D12",
  ink: "#0B1B21",
} as const;

const premadelabDark: PaletteTokens = {
  primary: {
    main: premadelabBrand.mint,
    light: premadelabBrand.mintBright,
    dark: premadelabBrand.mintDeep,
    contrastText: "#03130F",
  },
  secondary: {
    main: premadelabBrand.coral,
    light: "#FF9E85",
    dark: "#D2553A",
    contrastText: "#1A0703",
  },
  success: { main: "#4FB783", contrastText: "#04120B" },
  // Ambre et non orange : l'orange se confondrait avec le corail.
  warning: { main: "#E3A93B", contrastText: "#1A1204" },
  error: { main: "#E0576B", contrastText: "#1A050A" },
  info: { main: "#5B9BE8", contrastText: "#04101D" },
  background: {
    default: premadelabBrand.night,
    paper: "#0F171F",
    raised: "#16212B",
  },
  text: { primary: "#E6EEF1", secondary: "#9AAEB7", disabled: "#62747C" },
  divider: "rgba(154, 174, 183, 0.20)",
  outline: "rgba(61, 214, 181, 0.14)",
};

const premadelabLight: PaletteTokens = {
  primary: {
    main: premadelabBrand.teal,
    light: "#2A8C7A",
    dark: "#094B40",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: premadelabBrand.coralDeep,
    light: "#CF6A50",
    dark: "#7F2C1A",
    contrastText: "#FFFFFF",
  },
  success: { main: "#1F7A50", contrastText: "#FFFFFF" },
  warning: { main: "#9A5312", contrastText: "#FFFFFF" },
  error: { main: "#B02A3C", contrastText: "#FFFFFF" },
  info: { main: "#1F5FA9", contrastText: "#FFFFFF" },
  background: { default: "#EFF4F5", paper: "#FFFFFF", raised: "#F6FAFA" },
  text: {
    primary: premadelabBrand.ink,
    secondary: "#4A5D65",
    disabled: "#85969C",
  },
  divider: "#D3DFE2",
  outline: "#DDEAEC",
};

export const identities: Record<AppBrand, Identity> = {
  schub: {
    palettes,
    backdrops,
    textures,
    chart: chartColors,
    status: statusColors,
    elevations,
    selection: "rgba(164, 71, 126, 0.45)",
  },
  premadelab: {
    palettes: { dark: premadelabDark, light: premadelabLight },
    backdrops: {
      dark: {
        page:
          "radial-gradient(1100px 620px at 8% -14%, rgba(61, 214, 181, 0.16) 0%, transparent 62%), " +
          "radial-gradient(900px 540px at 108% 112%, rgba(255, 122, 89, 0.12) 0%, transparent 58%), " +
          premadelabBrand.night,
        panel: `linear-gradient(180deg, ${premadelabBrand.night} 0%, #0C141B 100%)`,
      },
      light: {
        page:
          "radial-gradient(1100px 620px at 8% -14%, rgba(14, 107, 91, 0.10) 0%, transparent 62%), " +
          "radial-gradient(900px 540px at 108% 112%, rgba(180, 67, 42, 0.08) 0%, transparent 58%), " +
          "#EFF4F5",
        panel: "linear-gradient(180deg, #F6FAFA 0%, #E8F0F1 100%)",
      },
    },
    textures: {
      dark: { grid: "rgba(61, 214, 181, 0.05)", gridSize: 32 },
      light: { grid: "rgba(14, 107, 91, 0.05)", gridSize: 32 },
    },
    chart: {
      dark: {
        mark: premadelabBrand.mint,
        markSoft: "rgba(61, 214, 181, 0.24)",
        // Violet et non corail : menthe et corail se confondent en deutéranopie.
        markSecondary: "#B79CFF",
        markMuted: "rgba(154, 174, 183, 0.55)",
        track: "rgba(154, 174, 183, 0.14)",
        grid: premadelabDark.outline,
        positive: premadelabDark.success.main,
        negative: premadelabDark.error.main,
      },
      light: {
        mark: premadelabBrand.teal,
        markSoft: "rgba(14, 107, 91, 0.18)",
        markSecondary: "#6D4FC4",
        markMuted: "rgba(11, 27, 33, 0.40)",
        track: "rgba(11, 27, 33, 0.10)",
        grid: premadelabLight.outline,
        positive: premadelabLight.success.main,
        negative: premadelabLight.error.main,
      },
    },
    status: {
      dark: {
        online: premadelabDark.success.main,
        offline: "#5E6E76",
        unknown: premadelabDark.warning.main,
        unreachable: premadelabDark.error.main,
      },
      light: {
        online: premadelabLight.success.main,
        offline: "#6E7E84",
        unknown: premadelabLight.warning.main,
        unreachable: premadelabLight.error.main,
      },
    },
    elevations: {
      dark: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.6)",
        md: "0 10px 30px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(123, 232, 208, 0.06)",
        lg: "0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(123, 232, 208, 0.09)",
      },
      light: {
        sm: "0 1px 2px rgba(11, 27, 33, 0.06)",
        md: "0 6px 16px rgba(11, 27, 33, 0.08)",
        lg: "0 18px 40px rgba(11, 27, 33, 0.12)",
      },
    },
    selection: "rgba(61, 214, 181, 0.35)",
  },
};
