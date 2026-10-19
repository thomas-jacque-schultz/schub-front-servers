import { requestJson } from "../../common";

export interface PremadeLabSettingsDto {
  unknownPlayerBudget: number;
  budgetWindowMinutes: number;
}

export const getPremadeLabSettingsApi =
  async (): Promise<PremadeLabSettingsDto> =>
    requestJson<PremadeLabSettingsDto>("/premadelab/settings", {
      method: "GET",
    });

export const updatePremadeLabSettingsApi = async (
  settings: PremadeLabSettingsDto,
): Promise<PremadeLabSettingsDto> =>
  requestJson<PremadeLabSettingsDto>("/premadelab/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });

export interface RecentSessionDto {
  day: string;
  startedAt: string;
  teamName: string;
  games: number;
  wins: number;
  planned: boolean;
}

export interface SessionSummaryTestDto {
  text?: string;
  status?: "SENT" | "UNREACHABLE" | "DISABLED" | "FAILED";
  detail?: string | null;
}

export const getSessionSummaryTestSessionsApi = async (): Promise<
  RecentSessionDto[]
> =>
  requestJson<RecentSessionDto[]>("/premadelab/session-summary-test", {
    method: "GET",
  });

export const sendSessionSummaryTestApi = async (
  day: string,
): Promise<SessionSummaryTestDto> =>
  requestJson<SessionSummaryTestDto>(
    `/premadelab/session-summary-test?day=${encodeURIComponent(day)}`,
    { method: "POST" },
  );
