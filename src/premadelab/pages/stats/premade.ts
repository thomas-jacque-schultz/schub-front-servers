import type { PlayerStatsDto, StatLineDto } from "../../types/stats";
import type { MetricKey } from "./metrics";

export interface PremadeFigure {
  value: number | null;
  /** Premade moins ses stats de toutes ses parties. */
  versusSelf: number | null;
  /** Premade moins la moyenne premade des autres membres. */
  versusTeammates: number | null;
  /** 1 = le meilleur ; ex æquo au même rang. */
  rank: number | null;
}

const valeur = (line: StatLineDto | null, key: MetricKey) => {
  const v = line?.[key];
  return typeof v === "number" ? v : null;
};

export const lignesPremade = (players: PlayerStatsDto[]) =>
  players.flatMap((player) =>
    player.premade && player.premade.games > 0
      ? [{ memberId: player.memberId, line: player.premade }]
      : [],
  );

export const premadeFigure = (
  player: PlayerStatsDto,
  others: { memberId: string; line: StatLineDto }[],
  key: MetricKey,
  polarity: "higher" | "lower" | "neutral",
): PremadeFigure => {
  const mien = valeur(player.premade, key);
  if (mien === null || !player.premade || player.premade.games === 0) {
    return { value: null, versusSelf: null, versusTeammates: null, rank: null };
  }
  const solo = valeur(player.overall, key);
  const autres = others
    .filter((other) => other.memberId !== player.memberId)
    .map((other) => valeur(other.line, key))
    .filter((v): v is number => v !== null);
  const moyenne =
    autres.length === 0
      ? null
      : autres.reduce((somme, v) => somme + v, 0) / autres.length;
  const mieux = (v: number) => (polarity === "lower" ? v < mien : v > mien);
  return {
    value: mien,
    versusSelf: solo === null ? null : mien - solo,
    versusTeammates: moyenne === null ? null : mien - moyenne,
    rank: 1 + autres.filter(mieux).length,
  };
};

export const bornesPremade = (
  lines: StatLineDto[],
  keys: MetricKey[],
): Partial<Record<MetricKey, { low: number; high: number; mean: number }>> => {
  const bornes: Partial<
    Record<MetricKey, { low: number; high: number; mean: number }>
  > = {};
  keys.forEach((key) => {
    const valeurs = lines
      .map((line) => valeur(line, key))
      .filter((v): v is number => v !== null);
    if (valeurs.length >= 2) {
      bornes[key] = {
        low: Math.min(...valeurs),
        high: Math.max(...valeurs),
        mean: valeurs.reduce((somme, v) => somme + v, 0) / valeurs.length,
      };
    }
  });
  return bornes;
};
