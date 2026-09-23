import { requestJson } from "./httpClient";
import type {
  MyStatsDto,
  TeamGameDetailDto,
  TeamGamesStatsDto,
  TeamOppositionDto,
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

export const getTeamGameDetailApi = async (
  teamId: string,
  matchId: string,
): Promise<TeamGameDetailDto> =>
  requestJson<TeamGameDetailDto>(`/teams/${teamId}/stats/games/${encodeURIComponent(matchId)}`, {
    method: "GET",
  });

export const getTeamOppositionApi = async (
  teamId: string,
  days?: number | null,
): Promise<TeamOppositionDto> =>
  requestJson<TeamOppositionDto>(`/teams/${teamId}/stats/opposition${fenetre(days)}`, {
    method: "GET",
  });
