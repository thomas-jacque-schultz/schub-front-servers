import { useTranslation } from "react-i18next";
import type { SelectOption } from "../../../design-system";

/** Les fenêtres proposées. La valeur vide veut dire « tout l'historique connu ». */
export const FENETRES = ["", "30", "90", "180", "365"] as const;

export const useWindowOptions = (): SelectOption[] => {
  const { t } = useTranslation("stats");
  return FENETRES.map((value) => ({
    value,
    label: value ? t("window.days", { count: Number(value) }) : t("window.all"),
  }));
};
