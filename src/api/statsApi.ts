import { requestJson } from "./httpClient";
import type {
  MyStatsDto,
  TeamGamesStatsDto,
  TeamPlayersStatsDto,
} from "../types/stats";

/**
 * Les trois lectures de statistiques.
 *
 * <p>`getMyStatsApi` ne prend pas de joueur, et il n'existe pas de variante qui en prendrait un :
 * le sujet est la session. Un chemin portant un identifiant Riot laisserait sonder l'historique
 * de n'importe qui à partir d'un identifiant croisé dans une réponse d'équipe.</p>
 */

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
