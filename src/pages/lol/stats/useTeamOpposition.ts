import { useTranslation } from "react-i18next";
import { getTeamOppositionApi } from "../../../api/statsApi";
import { messageOf, useRequest } from "../../../api/useRequest";

export const useTeamOpposition = (teamId: string, periode: string) => {
  const { t } = useTranslation("stats");
  const {
    data: dto,
    error,
    isLoading,
  } = useRequest(`${teamId}/${periode}`, () =>
    getTeamOppositionApi(teamId, periode),
  );
  return {
    dto,
    error: error === null ? "" : messageOf(error, t("loadFailed")),
    isLoading,
  };
};
