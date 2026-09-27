export type FindingPolarity = "STRENGTH" | "WEAKNESS" | "NEUTRAL";
export type FindingCategory =
  "BEHAVIOUR" | "PERFORMANCE" | "KNOWLEDGE" | "BUILD";
export type FindingNature = "ACTION" | "CONSEQUENCE";

export interface ConditionTraceDto {
  role: "REQUIRED" | "OPTIONAL" | "EXCEPTION";
  signal: string;
  unit: "VALUE" | "PERCENTILE";
  from: number;
  to: number;
  observed: number | null;
  degree: number | null;
}

/** Un constat du moteur Augur : jamais de numéro de version côté joueur, toujours sa preuve. */
export interface FindingDto {
  pattern: string;
  label: Record<string, string>;
  sentence: Record<string, string>;
  polarity: FindingPolarity;
  category: FindingCategory;
  nature: FindingNature;
  confidence: number;
  evidence: ConditionTraceDto[];
  context: Record<string, string>;
}
