import { requestJson } from "../../common";

export interface ConditionDto {
  signal: string;
  unit: "VALUE" | "PERCENTILE";
  from: number;
  to: number;
  weight: number;
}

export type PatternStatus = "DRAFT" | "ACTIVE" | "RETIRED";

export interface PatternDto {
  key: string;
  version: number;
  status: PatternStatus;
  scope: "GAME" | "HABIT" | "TEAM";
  polarity: "STRENGTH" | "WEAKNESS" | "NEUTRAL";
  category: "BEHAVIOUR" | "PERFORMANCE" | "KNOWLEDGE" | "BUILD";
  nature: "ACTION" | "CONSEQUENCE";
  required: ConditionDto[];
  optional: ConditionDto[];
  exceptions: ConditionDto[];
  optionalInfluence: number;
  threshold: number;
  label: Record<string, string>;
  sentence: Record<string, string>;
  author: string | null;
  comment: string | null;
  createdAt: string | null;
  activatedAt: string | null;
}

export type PatternRequest = Omit<
  PatternDto,
  "version" | "status" | "author" | "createdAt" | "activatedAt"
> & { comment: string };

export interface ImpactDto {
  sampled: number;
  appearing: number;
  disappearing: number;
  unchanged: number;
  byTier: Record<string, [number, number]>;
  examples: {
    subject: string;
    tier: string;
    currentDegree: number;
    draftDegree: number;
  }[];
}

export interface TraceConditionDto {
  role: "REQUIRED" | "OPTIONAL" | "EXCEPTION";
  signal: string;
  unit: "VALUE" | "PERCENTILE";
  from: number;
  to: number;
  observed: number | null;
  degree: number | null;
}

export interface EvaluationDto {
  patternKey: string;
  version: number;
  degree: number;
  emitted: boolean;
  excepted: boolean;
  conditions: TraceConditionDto[];
}

const base = "/augur/patterns";

export const getPatternsApi = async (): Promise<PatternDto[]> =>
  requestJson<PatternDto[]>(base, { method: "GET" });

export const getPatternVersionsApi = async (
  key: string,
): Promise<PatternDto[]> =>
  requestJson<PatternDto[]>(`${base}/${encodeURIComponent(key)}/versions`, {
    method: "GET",
  });

export const draftPatternApi = async (
  request: PatternRequest,
): Promise<PatternDto> =>
  requestJson<PatternDto>(base, {
    method: "POST",
    body: JSON.stringify(request),
  });

export const getPatternImpactApi = async (
  key: string,
  version: number,
): Promise<ImpactDto> =>
  requestJson<ImpactDto>(
    `${base}/${encodeURIComponent(key)}/versions/${version}/impact`,
    {
      method: "GET",
    },
  );

export const activatePatternApi = async (
  key: string,
  version: number,
  comment: string,
): Promise<PatternDto> =>
  requestJson<PatternDto>(
    `${base}/${encodeURIComponent(key)}/versions/${version}/activate`,
    {
      method: "POST",
      body: JSON.stringify({ comment }),
    },
  );

export const rollbackPatternApi = async (
  key: string,
  comment: string,
): Promise<PatternDto> =>
  requestJson<PatternDto>(`${base}/${encodeURIComponent(key)}/rollback`, {
    method: "POST",
    body: JSON.stringify({ comment }),
  });

/** Riot ID en Nom#TAG ; sans partie, la trace porte sur les habitudes du joueur. */
export const getTraceApi = async (
  riotId: string,
  matchId?: string,
): Promise<EvaluationDto[]> => {
  const [nom, tag] = riotId.split("#").map((part) => part.trim());
  const params = matchId ? `?${new URLSearchParams({ matchId })}` : "";
  return requestJson<EvaluationDto[]>(
    `/players/${encodeURIComponent(`${nom}-${tag}`)}/trace${params}`,
    { method: "GET" },
  );
};
