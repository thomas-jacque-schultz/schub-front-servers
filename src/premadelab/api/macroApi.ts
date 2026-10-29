import { requestJson } from "../../common";
import type {
  MacroPlanDto,
  MacroPlanRequest,
  MacroPlanSummaryDto,
} from "../types/team";

// Les plans du Macro Planner d'une équipe (Schub#172) et le laissez-passer de leur salon (Schub#171).
const base = (teamId: string) => `/teams/${teamId}/macro-plans`;

export const listMacroPlansApi = (teamId: string) =>
  requestJson<MacroPlanSummaryDto[]>(base(teamId), { method: "GET" });

export const getMacroPlanApi = (teamId: string, planId: string) =>
  requestJson<MacroPlanDto>(`${base(teamId)}/${planId}`, { method: "GET" });

export const createMacroPlanApi = (teamId: string, request: MacroPlanRequest) =>
  requestJson<MacroPlanDto>(base(teamId), {
    method: "POST",
    body: JSON.stringify(request),
  });

// keepalive : l'enregistrement part même si l'onglet se ferme juste après.
export const updateMacroPlanApi = (
  teamId: string,
  planId: string,
  request: MacroPlanRequest,
) =>
  requestJson<MacroPlanDto>(`${base(teamId)}/${planId}`, {
    method: "PUT",
    body: JSON.stringify(request),
    keepalive: true,
  });

export const deleteMacroPlanApi = async (teamId: string, planId: string) => {
  await requestJson<unknown>(`${base(teamId)}/${planId}`, { method: "DELETE" });
};

export const getMacroPassApi = (teamId: string) =>
  requestJson<{ pass: string; expiresAt: string }>(
    `/teams/${teamId}/macro-pass`,
    { method: "POST" },
  );
