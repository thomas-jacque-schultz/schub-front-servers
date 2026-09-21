import { requestJson } from "./httpClient";
import type {
  AddMemberRequest,
  CompositionDto,
  CompositionRequest,
  TeamDto,
  TeamNameRequest,
  TeamSummaryDto,
  UpdateMemberRequest,
} from "../types/team";

/**
 * Les équipes. Le BFF relaie vers le cœur, qui porte le domaine.
 *
 * <p>Aucune de ces fonctions ne prend l'acteur en paramètre, et c'est le point : le cookie de
 * session part tout seul, le BFF en tire l'identifiant Discord et le transmet au cœur en
 * `X-Actor-Id`. C'est ce qui permet au cœur de calculer les `viewerCan…` pour la bonne
 * personne — et donc au front de n'avoir rien à décider.</p>
 *
 * <p><strong>Le contrôle fin est dans le cœur</strong> : le BFF laisse passer toute requête
 * authentifiée sur ces routes, parce qu'il ne sait pas qui est membre de quoi. Un refus arrive
 * donc en 403 depuis le cœur, et les écrans s'appuient sur les `viewerCan…` pour ne pas proposer
 * ce qui sera refusé.</p>
 */

export const getMyTeamsApi = async (): Promise<TeamSummaryDto[]> =>
  requestJson<TeamSummaryDto[]>("/teams", { method: "GET" });

export const getTeamApi = async (teamId: string): Promise<TeamDto> =>
  requestJson<TeamDto>(`/teams/${teamId}`, { method: "GET" });

export const createTeamApi = async (name: string): Promise<TeamDto> =>
  requestJson<TeamDto>("/teams", {
    method: "POST",
    body: JSON.stringify({ name } satisfies TeamNameRequest),
  });

export const renameTeamApi = async (teamId: string, name: string): Promise<TeamDto> =>
  requestJson<TeamDto>(`/teams/${teamId}`, {
    method: "PUT",
    body: JSON.stringify({ name } satisfies TeamNameRequest),
  });

export const deleteTeamApi = async (teamId: string): Promise<void> => {
  await requestJson<unknown>(`/teams/${teamId}`, { method: "DELETE" });
};

/**
 * Revendiquer les places qui attendaient son Riot ID.
 *
 * <p>Rendue disponible dès maintenant parce qu'elle est le pendant exact de l'ajout d'un membre
 * libre. Elle ne portera son plein effet qu'une fois la liaison du compte Riot livrée (lot D.3)
 * : sans `puuid` sur le compte, elle ne relie rien et rend une liste vide, ce qui est une
 * réponse honnête et non une panne.</p>
 */
export const claimTeamsApi = async (): Promise<TeamSummaryDto[]> =>
  requestJson<TeamSummaryDto[]>("/teams/claim", { method: "POST" });

/** Les trois écritures d'effectif rendent l'équipe entière : un seul appel redessine l'écran. */
export const addTeamMemberApi = async (
  teamId: string,
  request: AddMemberRequest,
): Promise<TeamDto> =>
  requestJson<TeamDto>(`/teams/${teamId}/members`, {
    method: "POST",
    body: JSON.stringify(request),
  });

export const updateTeamMemberApi = async (
  teamId: string,
  memberId: string,
  request: UpdateMemberRequest,
): Promise<TeamDto> =>
  requestJson<TeamDto>(`/teams/${teamId}/members/${memberId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const removeTeamMemberApi = async (teamId: string, memberId: string): Promise<TeamDto> =>
  requestJson<TeamDto>(`/teams/${teamId}/members/${memberId}`, { method: "DELETE" });

export const getCompositionsApi = async (teamId: string): Promise<CompositionDto[]> =>
  requestJson<CompositionDto[]>(`/teams/${teamId}/compositions`, { method: "GET" });

export const createCompositionApi = async (
  teamId: string,
  request: CompositionRequest,
): Promise<CompositionDto> =>
  requestJson<CompositionDto>(`/teams/${teamId}/compositions`, {
    method: "POST",
    body: JSON.stringify(request),
  });

export const updateCompositionApi = async (
  teamId: string,
  compositionId: string,
  request: CompositionRequest,
): Promise<CompositionDto> =>
  requestJson<CompositionDto>(`/teams/${teamId}/compositions/${compositionId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });

export const deleteCompositionApi = async (teamId: string, compositionId: string): Promise<void> => {
  await requestJson<unknown>(`/teams/${teamId}/compositions/${compositionId}`, {
    method: "DELETE",
  });
};
