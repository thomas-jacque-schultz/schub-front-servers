import { requestJson } from "./httpClient";
import type {
  ChampionGridDto,
  MyStatsDto,
  MyGamesDto,
  ReferenceGridDto,
  ReferenceScope,
  StatsRefreshDto,
  TeamGameDetailDto,
  TeamGamesStatsDto,
  TeamOppositionDto,
  TeamPlayersStatsDto,
} from "../types/stats";
import { fenetreParams, type StatsWindow } from "../pages/lol/stats/windows";

const fenetre = (periode?: StatsWindow | null) => {
  const params = new URLSearchParams(fenetreParams(periode)).toString();
  return params ? `?${params}` : "";
};

// 30 : le maximum du cœur, le choix de champions porte sur tout ce qui a été joué.
const avecChampions = (periode?: StatsWindow | null) =>
  `?${new URLSearchParams({ ...fenetreParams(periode), champions: "30" })}`;

export const getTeamPlayersStatsApi = async (
  teamId: string,
  periode?: StatsWindow | null,
): Promise<TeamPlayersStatsDto> =>
  requestJson<TeamPlayersStatsDto>(
    `/teams/${teamId}/stats/players${avecChampions(periode)}`,
    {
      method: "GET",
    },
  );

export const getTeamGamesStatsApi = async (
  teamId: string,
  periode?: StatsWindow | null,
): Promise<TeamGamesStatsDto> =>
  requestJson<TeamGamesStatsDto>(
    `/teams/${teamId}/stats/team${fenetre(periode)}`,
    { method: "GET" },
  );

export const getMyStatsApi = async (
  periode?: StatsWindow | null,
): Promise<MyStatsDto> =>
  requestJson<MyStatsDto>(`/me/stats${avecChampions(periode)}`, {
    method: "GET",
  });

export const getTeamGameDetailApi = async (
  teamId: string,
  matchId: string,
  periode?: StatsWindow | null,
): Promise<TeamGameDetailDto> =>
  requestJson<TeamGameDetailDto>(
    `/teams/${teamId}/stats/games/${encodeURIComponent(matchId)}${fenetre(periode)}`,
    { method: "GET" },
  );

export const getMyGamesApi = async (
  periode?: StatsWindow | null,
): Promise<MyGamesDto> =>
  requestJson<MyGamesDto>(`/me/stats/games${fenetre(periode)}`, {
    method: "GET",
  });

export const getMyGameDetailApi = async (
  matchId: string,
  periode?: StatsWindow | null,
): Promise<TeamGameDetailDto> =>
  requestJson<TeamGameDetailDto>(
    `/me/stats/games/${encodeURIComponent(matchId)}${fenetre(periode)}`,
    { method: "GET" },
  );

export const getTeamOppositionApi = async (
  teamId: string,
  periode?: StatsWindow | null,
): Promise<TeamOppositionDto> =>
  requestJson<TeamOppositionDto>(
    `/teams/${teamId}/stats/opposition${fenetre(periode)}`,
    {
      method: "GET",
    },
  );

export const getStatsRefreshApi = async (
  teamId: string,
): Promise<StatsRefreshDto> =>
  requestJson<StatsRefreshDto>(`/teams/${teamId}/stats/refresh`, {
    method: "GET",
  });

export const refreshTeamStatsApi = async (
  teamId: string,
): Promise<StatsRefreshDto> =>
  requestJson<StatsRefreshDto>(`/teams/${teamId}/stats/refresh`, {
    method: "POST",
  });

/** Null : pas encore de référentiel pour ce poste (le serveur répond 204). */
export const getReferenceGridApi = async (
  position: string,
  scope: ReferenceScope,
  tier?: string | null,
): Promise<ReferenceGridDto | null> => {
  const params = new URLSearchParams({ scope, ...(tier ? { tier } : {}) });
  const grille = await requestJson<Partial<ReferenceGridDto>>(
    `/lol/references/${position}?${params}`,
    { method: "GET" },
  );
  return grille.metrics ? (grille as ReferenceGridDto) : null;
};

/** Null : pas encore de référentiel pour ce champion. */
export const getChampionGridApi = async (
  championId: string,
  tier: string,
): Promise<ChampionGridDto | null> => {
  const grille = await requestJson<Partial<ChampionGridDto>>(
    `/lol/references/champions/${championId}?${new URLSearchParams({ tier })}`,
    { method: "GET" },
  );
  return grille.metrics ? (grille as ChampionGridDto) : null;
};
