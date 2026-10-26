// La géométrie de la règle : la Faille est un carré de 14 900 unités, origine en bas à gauche (camp bleu), y vers
// le haut. L'écran, lui, a son y vers le bas.
export const MAP_SIZE = 14900;

export interface MapPoint {
  x: number;
  y: number;
}

export const toScreen = (point: MapPoint, size: number): MapPoint => ({
  x: (point.x / MAP_SIZE) * size,
  y: (1 - point.y / MAP_SIZE) * size,
});

export const toWorld = (point: MapPoint, size: number): MapPoint => ({
  x: clamp((point.x / size) * MAP_SIZE),
  y: clamp((1 - point.y / size) * MAP_SIZE),
});

const clamp = (value: number) => Math.min(MAP_SIZE, Math.max(0, value));

export const distance = (a: MapPoint, b: MapPoint) =>
  Math.hypot(b.x - a.x, b.y - a.y);

/** Le côté rouge est le côté bleu retourné autour du centre de la carte. */
export const mirror = (point: MapPoint): MapPoint => ({
  x: MAP_SIZE - point.x,
  y: MAP_SIZE - point.y,
});

/** Le repère le plus proche à moins de `tolerancePx` pixels à l'écran, sinon le point tel quel. */
export const snapTo = <T extends MapPoint>(
  point: MapPoint,
  landmarks: readonly T[],
  size: number,
  tolerancePx: number,
): MapPoint | T => {
  const tolerance = (tolerancePx / size) * MAP_SIZE;
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
