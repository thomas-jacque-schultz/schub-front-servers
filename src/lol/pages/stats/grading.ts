import type {
  ReferenceGridDto,
  ReferenceMetricDto,
} from "../../types/stats";

export const PALIERS_NOTES = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER_PLUS",
] as const;

export interface Grade {
  /** Parmi les joueurs de son palier, au même poste. De 0 à 1, « plus haut = mieux » quel que soit le sens. */
  inTier: number | null;
  tier: string | null;
  tierCount: number;
  /** Palier dont la moyenne par partie est la plus proche, quand la métrique suit le rang : c'est l'icône. */
  level: string | null;
  /** Les moyennes par partie de chaque palier, du plus bas au plus haut ; vide si la métrique ne suit pas le rang. */
  means: { tier: string; value: number }[];
}

/** Le palier dont la moyenne est la plus proche de la valeur. */
export const niveau = (
  valeur: number,
  moyennes: { tier: string; value: number }[],
): string | null =>
  moyennes.reduce<{ tier: string; value: number } | null>(
    (proche, palier) =>
      proche === null ||
      Math.abs(palier.value - valeur) < Math.abs(proche.value - valeur)
        ? palier
        : proche,
    null,
  )?.tier ?? null;

/** Maître, GM et Challenger ne forment qu'un palier tant que la population ne permet pas de les séparer. */
export const groupeDePalier = (
  tier: string | null | undefined,
): string | null => {
  if (!tier) {
    return null;
  }
  return ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)
    ? "MASTER_PLUS"
    : tier;
};

/** Même interpolation que le connecteur : sur un palier plat, la part des valeurs inférieures ou égales. */
export const repartition = (
  percentiles: number[],
  valeurs: number[],
  x: number,
): number => {
  if (x < valeurs[0]) {
    return 0;
  }
  if (x >= valeurs[valeurs.length - 1]) {
    return 1;
  }
  let i = 0;
  while (valeurs[i + 1] <= x) {
    i++;
  }
  const [v0, v1] = [valeurs[i], valeurs[i + 1]];
  return (
    percentiles[i] +
    ((percentiles[i + 1] - percentiles[i]) * (x - v0)) / (v1 - v0)
  );
};

export const noter = (
  valeur: number | null | undefined,
  metrique: ReferenceMetricDto | undefined,
  grille: ReferenceGridDto,
  tier: string | null | undefined,
): Grade | null => {
  if (
    valeur === null ||
    valeur === undefined ||
    !metrique ||
    metrique.polarity === "NEUTRAL"
  ) {
    return null;
  }
  const sens = (p: number) => (metrique.polarity === "LOWER" ? 1 - p : p);
  const groupe = groupeDePalier(tier);
  const sienne = groupe ? metrique.tiers[groupe] : undefined;
  const inTier = sienne
    ? sens(repartition(grille.percentiles, sienne.values, valeur))
    : null;
  const means = Object.entries(metrique.rankMeans ?? {}).map(
    ([palier, value]) => ({ tier: palier, value }),
  );
  const level = niveau(valeur, means);
  if (inTier === null && level === null) {
    return null;
  }
  return {
    inTier,
    tier: sienne ? groupe : null,
    tierCount: sienne?.count ?? 0,
    level,
    means,
  };
};
