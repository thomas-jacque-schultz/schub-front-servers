export type TierGroup =
  | "IRON_BRONZE"
  | "SILVER_GOLD"
  | "PLATINUM_EMERALD"
  | "DIAMOND"
  | "MASTER_PLUS";

export type TierComboKind = "ADC_SUP" | "JGL_MID" | "JGL_MID_SUP";

export interface TierComboChampionDto {
  id: number;
  key: string | null;
  name: string | null;
  iconUrl: string | null;
}

export interface TierComboLineDto {
  champions: TierComboChampionDto[];
  games: number;
  wins: number;
  winRate: number;
  lowerBound: number;
}

export interface TierCombosDto {
  tier: TierGroup;
  kind: TierComboKind;
  /** Dans l'ordre des champions de chaque ligne. */
  positions: string[];
  computedAt: string;
  /** Camps comptés dans ce groupe de paliers. */
  games: number;
  /** Plancher de parties d'un combo affiché. */
  minGames: number;
  combos: TierComboLineDto[];
}
