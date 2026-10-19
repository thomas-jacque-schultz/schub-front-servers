import { requestJson } from "../../common";
import type { TierComboKind, TierCombosDto, TierGroup } from "../types/combos";

export const getTierCombosApi = async (
  tier: TierGroup,
  kind: TierComboKind,
): Promise<TierCombosDto> =>
  requestJson<TierCombosDto>(`/tier-combos/${tier}/${kind}`, {
    method: "GET",
  });
