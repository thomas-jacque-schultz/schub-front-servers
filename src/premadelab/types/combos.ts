import type { Schemas } from "../../common";

export type TierGroup =
  | "IRON_BRONZE"
  | "SILVER_GOLD"
  | "PLATINUM_EMERALD"
  | "DIAMOND"
  | "MASTER_PLUS";

export type TierComboKind = "ADC_SUP" | "JGL_MID" | "JGL_MID_SUP";

export type TierComboChampionDto = Schemas["TierComboChampion"];

export type TierComboLineDto = Schemas["Line"];

export type TierCombosDto = Schemas["TierCombosDto"];
