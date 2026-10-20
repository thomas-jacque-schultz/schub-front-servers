import type { Schemas } from "../../common";
import { requestJson } from "../../common";

export type PremadeLabSettingsDto = Schemas["PremadeLabSettingsDto"];

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

export type RecentSessionDto = Schemas["RecentSessionDto"];

export type DiscordEmbedDto = Schemas["SessionSummaryEmbedDto"];

export type SessionSummaryTestDto = Schemas["SessionSummaryTestDto"];

export const getSessionSummaryTestSessionsApi = async (): Promise<
  RecentSessionDto[]
> =>
  requestJson<RecentSessionDto[]>("/premadelab/session-summary-test", {
    method: "GET",
  });

export const sendSessionSummaryTestApi = async (
  day: string,
  send: boolean,
): Promise<SessionSummaryTestDto> =>
  requestJson<SessionSummaryTestDto>(
    `/premadelab/session-summary-test?day=${encodeURIComponent(day)}&send=${send}`,
    { method: "POST" },
  );
