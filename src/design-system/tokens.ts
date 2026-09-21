/**
 * Tokens du design system — la source de vérité unique des couleurs, espacements, rayons,
 * ombres et typographie de Schub.
 *
 * <p>Avant ce fichier, deux systèmes de couleur coexistaient sans se parler : `theme.ts`
 * déclarait une palette claire pendant que `LandingPage`, `Login`, `Dashboard` et
 * `GameServerFormPage` peignaient des dégradés sombres en dur. Le sombre a été retenu comme
 * thème canonique (décision n°5 du plan du 18-09) ; les dégradés en question sont la matière
 * première de `backdrops.dark`, transposés ici une fois pour toutes.</p>
 *
 * <p>Règle d'usage : aucune valeur de couleur, de rayon ou d'ombre ne s'écrit ailleurs. Un
 * composant qui a besoin d'une nuance absente de ce fichier l'ajoute ici, il ne l'improvise pas
 * dans son `sx`.</p>
 */

/** Les deux schémas de couleur servis par le thème. */
export type ColorSchemeName = "light" | "dark";

/**
 * Les quatre statuts d'un serveur de jeu, tels que le cœur les expose.
 *
 * <p>Le design system redéclare ce type plutôt que d'importer `types/server` : une primitive ne
 * dépend pas du domaine, c'est ce qui la rend réutilisable par le portfolio et l'app d'équipe.</p>
 */
export type ServerStatusToken =
  "online" | "offline" | "unknown" | "unreachable";

/**
 * Couleurs de marque, indépendantes du schéma.
 *
 * <p>`teal` vient de la palette claire historique (`#0b7a6c`), `amber` de sa couleur secondaire
 * (`#d56c11`), `abyss` et `deepBlue` des dégradés sombres qui étaient codés en dur.</p>
 */
export const brand = {
  teal: "#0b7a6c",
  tealBright: "#2fa08f",
  amber: "#d56c11",
  amberBright: "#e59a45",
  deepBlue: "#0d47a1",
  deepGreen: "#004d40",
  abyss: "#071019",
} as const;

/** Une palette complète, déclinée par schéma de couleur. */
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
  /** Teinte des bordures de cartes et de tableaux, plus discrète que `divider`. */
  outline: string;
}

/**
 * Palette sombre — **canonique**. C'est elle qu'on dessine en premier ; la claire en est la
 * transposition, pas l'inverse.
 */
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

/**
 * Palette claire — reprise de `theme.ts`, conservée en alternative consultable.
 */
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

/** Les deux palettes, indexées par schéma. */
export const palettes: Record<ColorSchemeName, PaletteTokens> = {
  dark: darkPalette,
  light: lightPalette,
};

/**
 * Fonds de page.
 *
 * <p>C'est la transposition en token des `radial-gradient(...)` qui traînaient dans quatre
 * écrans. `page` habille les écrans pleine hauteur, `panel` les zones internes plus calmes.</p>
 */
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

/** Couleur de chaque statut de serveur, par schéma. */
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

/**
 * Échelle d'espacement : un pas de 8 px, comme MUI. Les composants parlent en pas
 * (`spacing(2)` = 16 px), jamais en pixels.
 */
export const spacingUnit = 8;

/** Rayons de bordure. `pill` sert aux puces et aux badges. */
export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

/**
 * Ombres. Elles diffèrent par schéma : sur fond sombre, une ombre noire ne se voit pas — c'est
 * le liseré clair qui donne le relief.
 */
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

/** Typographie. Une seule famille, déclarée une seule fois. */
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

/** Durées d'animation, pour que deux composants ne choisissent pas deux vitesses. */
export const motion = {
  fast: 120,
  normal: 200,
  slow: 320,
} as const;

/**
 * Couleurs des graphiques.
 *
 * <p>Une seule teinte de marque, jamais une palette catégorielle : tous les graphiques d'ici sont
 * à série unique, et deux teintes voisines du thème (`primary` et `success`) sont
 * indistinguables pour une vision deutéranope — vérifié, pas supposé.</p>
 *
 * <p>`mark` en clair n'est pas `primary.main` : le teal de marque tombe juste sous le plancher de
 * saturation d'une marque graphique sur fond blanc et se lit gris. `#0a8a74` est le même teal,
 * remonté jusqu'à passer.</p>
 *
 * <p>Un écart se lit au signe et à la valeur avant de se lire à la couleur : `positive` et
 * `negative` accompagnent un texte, ils ne le remplacent jamais.</p>
 */
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
