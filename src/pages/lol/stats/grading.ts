import type {
  ReferenceGridDto,
  ReferenceMetricDto,
} from "../../../types/stats";

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
  /** Tous paliers confondus, pondérés par le ladder. */
  ladder: number | null;
  /** Palier de l'échelle du ladder où tombe la valeur : c'est l'icône. */
  level: string | null;
}

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
  const ladder = metrique.ladder
    ? sens(repartition(grille.percentiles, metrique.ladder, valeur))
    : null;
  const level =
    ladder === null
      ? null
      : ([...grille.levels]
          .reverse()
          .find((niveau) => ladder >= niveau.fromPercentile)?.tier ?? null);
  if (inTier === null && ladder === null) {
    return null;
  }
  return {
    inTier,
    tier: sienne ? groupe : null,
    tierCount: sienne?.count ?? 0,
    ladder,
    level,
  };
};
