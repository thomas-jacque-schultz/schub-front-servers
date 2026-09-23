import { requestJson } from "./httpClient";
import type {
  MyStatsDto,
  TeamGamesStatsDto,
  TeamPlayersStatsDto,
} from "../types/stats";

const fenetre = (days?: number | null) => (days ? `?days=${days}` : "");

export const getTeamPlayersStatsApi = async (
  teamId: string,
  days?: number | null,
): Promise<TeamPlayersStatsDto> =>
  requestJson<TeamPlayersStatsDto>(
    `/teams/${teamId}/stats/players${fenetre(days)}`,
    {
      method: "GET",
    },
  );

export const getTeamGamesStatsApi = async (
  teamId: string,
  days?: number | null,
): Promise<TeamGamesStatsDto> =>
  requestJson<TeamGamesStatsDto>(
    `/teams/${teamId}/stats/team${fenetre(days)}`,
    { method: "GET" },
  );

export const getMyStatsApi = async (
  days?: number | null,
): Promise<MyStatsDto> =>
  requestJson<MyStatsDto>(`/me/stats${fenetre(days)}`, { method: "GET" });
