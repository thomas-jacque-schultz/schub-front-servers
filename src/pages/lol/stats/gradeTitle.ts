import { useTranslation } from "react-i18next";
import type { Grade } from "./grading";
import { useStatsFormat } from "./statsFormat";

export const useGradeTitle = () => {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  return (
    grade: Grade,
    position: string,
    patches: string[],
    scope: "GAME" | "MEAN",
    valeur: (value: number) => string,
  ) => {
    const poste = format.poste(position);
    const palier = (tier: string) => t(`tier.${tier}`, { defaultValue: tier });
    const rang = grade.medians.findIndex((m) => m.tier === grade.level);
    const voisins = grade.medians
      .filter((_, i) => Math.abs(i - rang) === 1)
      .map((m) => `${palier(m.tier)} ${valeur(m.value)}`)
      .join(" · ");
    return [
      grade.level
        ? t("grade.level", {
            tier: palier(grade.level),
            median: valeur(grade.medians[rang].value),
            position: poste,
          })
        : t("grade.noRank"),
      grade.level && voisins ? t("grade.neighbours", { list: voisins }) : null,
      grade.inTier !== null && grade.tier
        ? t(scope === "GAME" ? "grade.inTierGame" : "grade.inTier", {
            rank: Math.round(grade.inTier * 100),
            tier: palier(grade.tier),
            position: poste,
            count: grade.tierCount,
          })
        : null,
      scope === "MEAN"
        ? t("grade.basis", { position: poste, patches: patches.join(", ") })
        : null,
    ]
      .filter(Boolean)
      .join(" ");
  };
};
