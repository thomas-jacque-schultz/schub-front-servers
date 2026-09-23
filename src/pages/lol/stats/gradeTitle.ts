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
  ) => {
    const poste = format.poste(position);
    const palier = (tier: string) => t(`tier.${tier}`, { defaultValue: tier });
    return [
      grade.level && grade.ladder !== null
        ? t("grade.level", {
            tier: palier(grade.level),
            ladder: format.taux(grade.ladder),
            position: poste,
          })
        : t("grade.noLadder"),
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
