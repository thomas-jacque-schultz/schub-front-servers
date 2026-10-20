import type { Schemas } from "../../common";
import { requestJson } from "../../common";

export type ConditionDto = Schemas["ConditionDto"];

export type PatternStatus = "DRAFT" | "ACTIVE" | "RETIRED";

export type PatternDto = Schemas["PatternDto"];

export type PatternRequest = Omit<
  PatternDto,
  "version" | "status" | "author" | "createdAt" | "activatedAt"
> & { comment: string };

export type ImpactDto = Schemas["ImpactDto"];

export type TraceConditionDto = Schemas["ConditionTraceDto"];

export type EvaluationDto = Schemas["EvaluationDto"];

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
