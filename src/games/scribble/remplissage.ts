// Le pot de peinture (Schub#164) : chacun remplit sur son propre tableau, à sa résolution. Le message ne porte qu'un
// point et une couleur, jamais de pixels.

/** L'écart toléré par canal : le bord d'un trait est lissé, ses pixels mêlent le trait et le fond. */
const TOLERANCE = 48;

export interface Pixels {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

/** La couleur d'un remplissage en RGBA ; null pour la gomme, qui rend la zone transparente. */
export const enRgba = (couleur: string | null): number[] => {
  if (couleur === null) {
    return [0, 0, 0, 0];
  }
  const hex = /^#([0-9a-f]{6})$/i.exec(couleur)?.[1] ?? "000000";
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).concat(255);
};

/**
 * Remplit la zone qui touche (x, y) et a la même couleur, à la tolérance près, puis l'élargit d'un pixel : sans ça,
 * le liseré lissé du trait resterait entre la zone et le trait.
 */
export const remplis = (
  pixels: Pixels,
  x: number,
  y: number,
  rgba: number[],
): boolean => {
  const { width: l, height: h, data } = pixels;
  if (x < 0 || y < 0 || x >= l || y >= h) {
    return false;
  }
  const depart = (y * l + x) * 4;
  const cible = data.slice(depart, depart + 4);
  if (cible.every((v, i) => v === rgba[i])) {
    return false;
  }
  const proche = (i: number) =>
    Math.abs(data[i] - cible[0]) <= TOLERANCE &&
    Math.abs(data[i + 1] - cible[1]) <= TOLERANCE &&
    Math.abs(data[i + 2] - cible[2]) <= TOLERANCE &&
    Math.abs(data[i + 3] - cible[3]) <= TOLERANCE;

  const zone = new Uint8Array(l * h);
  const pile = [y * l + x];
  while (pile.length > 0) {
    const n = pile.pop()!;
    if (zone[n] || !proche(n * 4)) {
      continue;
    }
    zone[n] = 1;
    const px = n % l;
    if (px > 0) pile.push(n - 1);
    if (px < l - 1) pile.push(n + 1);
    if (n >= l) pile.push(n - l);
    if (n < l * (h - 1)) pile.push(n + l);
  }

  for (let n = 0; n < zone.length; n++) {
    const px = n % l;
    const touche =
      zone[n] ||
      (px > 0 && zone[n - 1]) ||
      (px < l - 1 && zone[n + 1]) ||
      (n >= l && zone[n - l]) ||
      (n < l * (h - 1) && zone[n + l]);
    if (touche) {
      data.set(rgba, n * 4);
    }
  }
  return true;
};
