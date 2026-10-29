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

// L'ambiance des mini-jeux (Schub#145) : la même identité, prune, or et noir, en plus joueur. Les jeux sont
// sombres seulement. Rayons ronds, police ronde, liseré prune lumineux : ce que le site de statistiques ne fait
// pas, pour qu'un jeu ne se lise plus comme un tableau de bord.
export const playful = {
  fontFamily:
    "'Fredoka Variable', 'Fredoka', 'Space Grotesk Variable', 'Segoe UI', sans-serif",
  radii: { control: 12, card: 18 },
  edge: "rgba(164, 71, 126, 0.55)",
  glow: "0 0 0 1px rgba(164, 71, 126, 0.30), 0 0 32px rgba(164, 71, 126, 0.22), 0 18px 40px rgba(0, 0, 0, 0.55)",
  panel:
    "linear-gradient(180deg, rgba(40, 18, 44, 0.94) 0%, rgba(21, 13, 24, 0.94) 100%)",
  // Les boutons secondaires sont des tuiles prune, les champs un fond opaque : les griffonnages ne passent pas dessous.
  tile: "rgba(164, 71, 126, 0.18)",
  tileHover: "rgba(164, 71, 126, 0.34)",
  field: "rgba(21, 13, 24, 0.88)",
  // Le bouton principal a une tranche d'or foncé : il s'enfonce quand on appuie.
  press: { depth: 4, edge: brand.goldDeep },
  page:
    "radial-gradient(900px 560px at 15% -10%, rgba(164, 71, 126, 0.40) 0%, transparent 60%), " +
    "radial-gradient(800px 520px at 100% 110%, rgba(107, 40, 83, 0.48) 0%, transparent 60%), " +
    "linear-gradient(180deg, #1A0B1A 0%, #0D060E 100%)",
  doodle: {
    gold: "rgba(201, 162, 39, 0.40)",
    prune: "rgba(192, 107, 160, 0.45)",
  },
  brush: brand.prune,
  // Le bas d'une couverture se fond dans le panneau de la jaquette.
  coverFade:
    "linear-gradient(180deg, transparent 45%, rgba(40, 18, 44, 0.94) 100%)",
  confetti: [
    brand.gold,
    brand.goldBright,
    brand.pruneBright,
    "#C36BA0",
    "#4FB783",
  ],
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
    // Parts d'un tout, dans cet ordre (validées : bande de luminosité, daltonisme, contraste).
    categories: string[];
    // Échelle de verdict en cinq crans (Schub#92), du plus bas au plus haut. Contraste sur le papier :
    // sombre 5,1 · 8,2 · 7,9 · 10,0 · 7,5 ; clair 6,5 · 4,6 · 6,1 · 4,2 · 6,5. Le pictogramme double le cran :
    // rouge et vert ne se lisent pas seuls en deutéranopie.
    verdict: [string, string, string, string, string];
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
    categories: ["#B38C1C", "#C07AA6", "#3987E5", "#199E70", "#D95926"],
    verdict: ["#E0576B", "#E8968F", "#B6A3B4", "#8CCBA9", "#4FB783"],
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
    categories: ["#9A7512", "#A4477E", "#2A78D6", "#199E70", "#EB6834"],
    verdict: ["#B02A3C", "#B65A4C", "#6E5D6B", "#3B8A62", "#1F6B46"],
  },
};

// Les encres d'un dessin (scribble, Macro Planner) : des couleurs de données, les mêmes dans les deux schémas.
export const inkColors = [
  "#F2E9EE",
  "#8A8A8A",
  "#E0576B",
  "#FF8C42",
  "#FFD23F",
  "#C9A227",
  "#8B5A2B",
  "#9BE564",
  "#4FB783",
  "#2E7D32",
  "#3DDBD9",
  "#5B9BE8",
  "#1E3A8A",
  "#8E5CF7",
  "#A4477E",
  "#FF77B7",
] as const;

// Les épaisseurs d'un trait, relatives à la largeur du tableau ou de la carte : six crans, choisis à la molette.
export const inkWidths = [0.003, 0.006, 0.01, 0.015, 0.022, 0.032] as const;

// La Faille dessinée par le Macro Planner (MacroMap) : un fond de jungle, des couloirs à peine plus clairs, la rivière
// et les deux camps en bleu et rouge, dilués pour que la mesure, en or, reste ce qu'on lit d'abord.
export const mapColors: Record<
  ColorSchemeName,
  {
    jungle: string;
    lane: string;
    river: string;
    grid: string;
    blue: string;
    blueBase: string;
    red: string;
    redBase: string;
    camp: string;
    objective: string;
  }
> = {
  dark: {
    jungle: "#1C1322",
    lane: "rgba(182, 163, 180, 0.17)",
    river: "rgba(91, 155, 232, 0.13)",
    grid: "rgba(201, 162, 39, 0.07)",
    blue: darkPalette.info.main,
    blueBase: "rgba(91, 155, 232, 0.16)",
    red: darkPalette.error.main,
    redBase: "rgba(224, 87, 107, 0.16)",
    camp: darkPalette.text.secondary,
    objective: "#C07AA6",
  },
  light: {
    jungle: "#DCCDD6",
    lane: "rgba(255, 255, 255, 0.85)",
    river: "rgba(31, 95, 169, 0.12)",
    grid: "rgba(107, 40, 83, 0.08)",
    blue: lightPalette.info.main,
    blueBase: "rgba(31, 95, 169, 0.12)",
    red: lightPalette.error.main,
    redBase: "rgba(176, 42, 60, 0.12)",
    camp: lightPalette.text.secondary,
    objective: "#8E3E6F",
  },
};

// ---------------------------------------------------------------------------------------------
// L'identité commune à Schub et à PremadeLab (Schub#60) : prune, or et noir. Seuls le nom, le logo
// et le titre de l'onglet distinguent les deux applications.
// ---------------------------------------------------------------------------------------------

export interface Identity {
  palettes: Record<ColorSchemeName, PaletteTokens>;
  backdrops: Record<ColorSchemeName, { page: string; panel: string }>;
  textures: Record<ColorSchemeName, { grid: string; gridSize: number }>;
  chart: typeof chartColors;
  map: typeof mapColors;
  status: typeof statusColors;
  elevations: typeof elevations;
  selection: string;
}

export const identity: Identity = {
  palettes,
  backdrops,
  textures,
  chart: chartColors,
  map: mapColors,
  status: statusColors,
  elevations,
  selection: "rgba(164, 71, 126, 0.45)",
};
