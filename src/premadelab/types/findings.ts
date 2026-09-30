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
  // La mesure brute du signal ; `observed` est le centile quand la condition est en centile.
  value?: number | null;
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
  experimental: boolean;
  limits: Record<string, string>;
  evidence: ConditionTraceDto[];
  context: Record<string, string>;
}
