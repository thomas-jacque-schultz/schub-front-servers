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

export const textures: Record<ColorSchemeName, { grid: string; gridSize: number }> = {
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
    track: string;
    grid: string;
    positive: string;
    negative: string;
  }
> = {
  dark: {
    mark: brand.gold,
    markSoft: "rgba(201, 162, 39, 0.26)",
    track: "rgba(182, 163, 180, 0.14)",
    grid: darkPalette.outline,
    positive: darkPalette.success.main,
    negative: darkPalette.error.main,
  },
  light: {
    mark: brand.goldDeep,
    markSoft: "rgba(138, 107, 18, 0.20)",
    track: "rgba(28, 10, 24, 0.10)",
    grid: lightPalette.outline,
    positive: lightPalette.success.main,
    negative: lightPalette.error.main,
  },
};
