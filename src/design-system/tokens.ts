export type ColorSchemeName = "light" | "dark";

export type ServerStatusToken =
  "online" | "offline" | "unknown" | "unreachable";

export const brand = {
  teal: "#0b7a6c",
  tealBright: "#2fa08f",
  amber: "#d56c11",
  amberBright: "#e59a45",
  deepBlue: "#0d47a1",
  deepGreen: "#004d40",
  abyss: "#071019",
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
    main: "#2fa08f",
    light: "#5cc4b3",
    dark: "#1d7466",
    contrastText: "#04110f",
  },
  secondary: {
    main: "#e59a45",
    light: "#f2b978",
    dark: "#b9762a",
    contrastText: "#1a1006",
  },
  success: { main: "#4caf7d", contrastText: "#04110b" },
  warning: { main: "#e0a33a", contrastText: "#1a1206" },
  error: { main: "#e06a6a", contrastText: "#1a0707" },
  info: { main: "#4d8bde", contrastText: "#04101d" },
  background: {
    default: brand.abyss,
    paper: "#0f1b26",
    raised: "#16242f",
  },
  text: {
    primary: "#e7eef4",
    secondary: "#9fb2c1",
    disabled: "#6b7f8e",
  },
  divider: "rgba(159, 178, 193, 0.22)",
  outline: "rgba(159, 178, 193, 0.16)",
};

export const lightPalette: PaletteTokens = {
  primary: {
    main: brand.teal,
    light: "#3d9d90",
    dark: "#075449",
    contrastText: "#ffffff",
  },
  secondary: {
    main: brand.amber,
    light: "#e28f45",
    dark: "#a04d06",
    contrastText: "#ffffff",
  },
  success: { main: "#2e7d52", contrastText: "#ffffff" },
  warning: { main: "#a96c10", contrastText: "#ffffff" },
  error: { main: "#b3261e", contrastText: "#ffffff" },
  info: { main: "#1f5fa9", contrastText: "#ffffff" },
  background: {
    default: "#eef3f0",
    paper: "#ffffff",
    raised: "#f7faf8",
  },
  text: {
    primary: "#132226",
    secondary: "#4a5a61",
    disabled: "#84969d",
  },
  divider: "#d8e2dd",
  outline: "#e2eae6",
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
      `radial-gradient(circle at 15% 25%, ${brand.deepBlue} 0%, transparent 35%), ` +
      `radial-gradient(circle at 85% 75%, ${brand.deepGreen} 0%, transparent 40%), ` +
      brand.abyss,
    panel: "linear-gradient(180deg, rgba(7,16,25,1) 0%, rgba(10,22,34,1) 100%)",
  },
  light: {
    page:
      "radial-gradient(circle at 15% 25%, #cfe0f5 0%, transparent 35%), " +
      "radial-gradient(circle at 85% 75%, #cfe8e1 0%, transparent 40%), " +
      "#eef3f0",
    panel: "linear-gradient(180deg, #f4f8f6 0%, #e7efeb 100%)",
  },
};

export const statusColors: Record<
  ColorSchemeName,
  Record<ServerStatusToken, string>
> = {
  dark: {
    online: darkPalette.success.main,
    offline: darkPalette.text.secondary,
    unknown: darkPalette.warning.main,
    unreachable: darkPalette.error.main,
  },
  light: {
    online: lightPalette.success.main,
    offline: lightPalette.text.secondary,
    unknown: lightPalette.warning.main,
    unreachable: lightPalette.error.main,
  },
};

export const spacingUnit = 8;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const elevations: Record<
  ColorSchemeName,
  { sm: string; md: string; lg: string }
> = {
  dark: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.45)",
    md: "0 6px 18px rgba(0, 0, 0, 0.5)",
    lg: "0 18px 40px rgba(0, 0, 0, 0.55)",
  },
  light: {
    sm: "0 1px 2px rgba(16, 24, 40, 0.06)",
    md: "0 6px 16px rgba(16, 24, 40, 0.08)",
    lg: "0 18px 40px rgba(16, 24, 40, 0.12)",
  },
};

export const typographyTokens = {
  fontFamily: "'Segoe UI', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
  monospaceFontFamily: "'JetBrains Mono', 'Fira Mono', 'Consolas', monospace",
  weights: {
    regular: 400,
    medium: 600,
    bold: 700,
    heavy: 800,
  },
  letterSpacing: {
    tight: "-0.01em",
    normal: "0",
    wide: "0.08em",
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
    mark: darkPalette.primary.main,
    markSoft: "rgba(47, 160, 143, 0.28)",
    track: "rgba(159, 178, 193, 0.18)",
    grid: darkPalette.outline,
    positive: darkPalette.success.main,
    negative: darkPalette.error.main,
  },
  light: {
    mark: "#0a8a74",
    markSoft: "rgba(10, 138, 116, 0.22)",
    track: "rgba(19, 34, 38, 0.10)",
    grid: lightPalette.outline,
    positive: lightPalette.success.main,
    negative: lightPalette.error.main,
  },
};
