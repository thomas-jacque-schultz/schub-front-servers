import { requestJson } from "./httpClient";
import type { ChampionPoolDto } from "../types/pool";
import type { GameRole } from "../types/team";

/** Le pool de champions d'une équipe. `TEAM_VIEW` sur cette équipe, tranché par le cœur. */
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

/**
 * Les champions retenus à un poste — la liste entière, qui remplace la précédente.
 *
 * <p>Les deux écritures rendent le panneau entier : un seul appel redessine l'écran.</p>
 */
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
