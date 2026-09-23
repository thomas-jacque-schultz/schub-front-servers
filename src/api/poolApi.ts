import { requestJson } from "./httpClient";
import type { ChampionPoolDto } from "../types/pool";
import type { GameRole } from "../types/team";

export const getChampionPoolApi = async (
  teamId: string,
  masteryFloor?: number | null,
): Promise<ChampionPoolDto> =>
  requestJson<ChampionPoolDto>(
    `/teams/${teamId}/champion-pool${
      masteryFloor === null || masteryFloor === undefined ? "" : `?masteryFloor=${masteryFloor}`
    }`,
    { method: "GET" },
  );

export const setPoolChampionsApi = async (
  teamId: string,
  role: GameRole,
  championKeys: string[],
): Promise<ChampionPoolDto> =>
  requestJson<ChampionPoolDto>(`/teams/${teamId}/champion-pool/roles/${role}`, {
    method: "PUT",
    body: JSON.stringify({ championKeys }),
  });

export const setPoolMasteryFloorApi = async (
  teamId: string,
  masteryFloor: number,
): Promise<ChampionPoolDto> =>
  requestJson<ChampionPoolDto>(`/teams/${teamId}/champion-pool/mastery-floor`, {
    method: "PUT",
    body: JSON.stringify({ masteryFloor }),
  });
