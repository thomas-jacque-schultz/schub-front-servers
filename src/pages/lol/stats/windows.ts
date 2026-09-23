import { useTranslation } from "react-i18next";
import type { SelectOption } from "../../../design-system";

/** « p2 » : les 2 derniers patchs ; un nombre : des jours ; vide : tout l'historique connu. */
export type StatsWindow = string;

export const FENETRES: StatsWindow[] = ["p2", "p4", "90", "180", ""];

export const fenetreParams = (
  fenetre?: StatsWindow | null,
): Record<string, string> => {
  if (!fenetre) {
    return {};
  }
  return fenetre.startsWith("p")
    ? { patches: fenetre.slice(1) }
    : { days: fenetre };
};

export const useWindowOptions = (): SelectOption[] => {
  const { t } = useTranslation("stats");
  return FENETRES.map((value) => ({
    value,
    label: !value
      ? t("window.all")
      : value.startsWith("p")
        ? t("window.patches", { count: Number(value.slice(1)) })
        : t("window.days", { count: Number(value) }),
  }));
};
