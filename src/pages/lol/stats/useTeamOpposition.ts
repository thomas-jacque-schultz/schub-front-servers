import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamOppositionApi } from "../../../api/statsApi";
import type { TeamOppositionDto } from "../../../types/stats";

export const useTeamOpposition = (teamId: string, periode: string) => {
  const { t } = useTranslation("stats");
  const [dto, setDto] = useState<TeamOppositionDto | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setDto(await getTeamOppositionApi(teamId, periode));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("loadFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [teamId, periode, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return { dto, error, isLoading };
};
