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

export const claimTeamsApi = async (): Promise<TeamSummaryDto[]> =>
  requestJson<TeamSummaryDto[]>("/teams/claim", { method: "POST" });

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
