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
