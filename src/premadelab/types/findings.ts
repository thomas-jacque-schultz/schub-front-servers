import type { Schemas } from "../../common";

export type FindingPolarity = "STRENGTH" | "WEAKNESS" | "NEUTRAL";
export type FindingCategory =
  "BEHAVIOUR" | "PERFORMANCE" | "KNOWLEDGE" | "BUILD";
export type FindingNature = "ACTION" | "CONSEQUENCE";

export type ConditionTraceDto = Schemas["ConditionTraceDto"];

/** Un constat du moteur Augur : jamais de numéro de version côté joueur, toujours sa preuve. */
export type FindingDto = Schemas["FindingDto"];
