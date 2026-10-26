import { useTranslation } from "react-i18next";
import { getTeamSynergyApi } from "../../api/statsApi";
import { messageOf, useRequest } from "../../../common";

// Une seule requête pour la synergie et le soutien entre les postes (Schub#156), qui lisent la même réponse.
export const useTeamSynergy = (teamId: string, periode: string) => {
  const { t } = useTranslation("stats");
  const {
    data: dto,
    error,
    isLoading,
  } = useRequest(`synergy/${teamId}/${periode}`, () =>
    getTeamSynergyApi(teamId, periode),
  );
  return {
    dto,
    error: error === null ? "" : messageOf(error, t("loadFailed")),
    isLoading,
  };
};
