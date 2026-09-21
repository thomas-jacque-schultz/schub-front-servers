import { requestJson } from "./httpClient";
import type { ChampionPoolDto } from "../types/pool";

/** Le pool de champions d'une équipe. `TEAM_VIEW` sur cette équipe, tranché par le cœur. */
export const getChampionPoolApi = async (
  teamId: string,
  champions?: number | null,
): Promise<ChampionPoolDto> =>
  requestJson<ChampionPoolDto>(
    `/teams/${teamId}/champion-pool${champions ? `?champions=${champions}` : ""}`,
    { method: "GET" },
  );
