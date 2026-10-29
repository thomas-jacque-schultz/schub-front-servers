// La géométrie du Macro Planner. Les coordonnées sont celles du jeu (timelines de Riot) : origine côté bleu, en bas à
// gauche, y vers le haut. La minimap de la Faille couvre ce rectangle, un peu plus haut que large ; les tours
// relevées dans les timelines s'y posent sur leurs socles.
export const MAP_BOUNDS = {
  minX: -120,
  minY: -120,
  maxX: 14870,
  maxY: 14980,
} as const;

const LARGEUR = MAP_BOUNDS.maxX - MAP_BOUNDS.minX;
const HAUTEUR = MAP_BOUNDS.maxY - MAP_BOUNDS.minY;

export interface MapPoint {
  x: number;
  y: number;
}

export const toScreen = (point: MapPoint, size: number): MapPoint => ({
  x: ((point.x - MAP_BOUNDS.minX) / LARGEUR) * size,
  y: (1 - (point.y - MAP_BOUNDS.minY) / HAUTEUR) * size,
});

export const toWorld = (point: MapPoint, size: number): MapPoint => ({
  x: borne(
    MAP_BOUNDS.minX + (point.x / size) * LARGEUR,
    MAP_BOUNDS.minX,
    MAP_BOUNDS.maxX,
  ),
  y: borne(
    MAP_BOUNDS.minY + (1 - point.y / size) * HAUTEUR,
    MAP_BOUNDS.minY,
    MAP_BOUNDS.maxY,
  ),
});

/** Un rayon en unités du jeu, en pixels sur chaque axe : la carte n'est pas tout à fait carrée. */
export const radiusOnScreen = (radius: number, size: number): MapPoint => ({
  x: (radius / LARGEUR) * size,
  y: (radius / HAUTEUR) * size,
});

/** Les unités du jeu que couvre un pixel de la carte, en largeur. */
export const unitsPerPixel = (size: number) => LARGEUR / size;

const borne = (valeur: number, min: number, max: number) =>
  Math.min(max, Math.max(min, valeur));

export const distance = (a: MapPoint, b: MapPoint) =>
  Math.hypot(b.x - a.x, b.y - a.y);

/** Le repère le plus proche à moins de `tolerancePx` pixels à l'écran, sinon le point tel quel. */
export const snapTo = <T extends MapPoint>(
  point: MapPoint,
  landmarks: readonly T[],
  size: number,
  tolerancePx: number,
): MapPoint | T => {
  const tolerance = (tolerancePx / size) * LARGEUR;
  let best: T | null = null;
  let bestDistance = tolerance;
  for (const landmark of landmarks) {
    const d = distance(point, landmark);
    if (d <= bestDistance) {
      best = landmark;
      bestDistance = d;
    }
  }
  return best ?? point;
};

export interface TerrainWeights {
  /** Ce qui se parcourt : couloirs, chemins de jungle, rivière et bases. Le reste est mur. */
  ground: number;
  river: number;
  base: number;
}

const part = (valeur: number) => Math.min(1, Math.max(0, valeur));

/**
 * Ce qu'un pixel de la minimap de Riot représente, de 0 à 1 par zone. Les murs y sont transparents, les chemins
 * kaki, la rivière d'un bleu franc (le bleu domine le rouge de plus de 100) et les bases gris-bleu (le vert passe
 * le rouge d'une trentaine). Les fontaines, aux coins, comptent dans la base ; la rivière ne les atteint pas,
 * et les bases ne dépassent pas leur coin : le fondu de la rivière dans les chemins a la même teinte qu'elles.
 * `u` et `v` placent le pixel dans l'image, de 0 à 1, depuis le coin haut gauche.
 */
export const terrainAt = (
  r: number,
  g: number,
  b: number,
  a: number,
  u: number,
  v: number,
): TerrainWeights => {
  const ground = part(a / 192);
  const coin = Math.min(Math.hypot(u, 1 - v), Math.hypot(1 - u, v));
  const river = coin < 0.3 ? 0 : part((b - r - 40) / 60);
  const base =
    coin < 0.1 ? 1 : coin > 0.5 ? 0 : part((g - r - 8) / 24) * (1 - river);
  return { ground, river: ground * river, base: ground * base };
};
