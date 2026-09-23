import { useTranslation } from "react-i18next";
import { Text, Tooltip } from "../../../design-system";
import bronze from "../../../assets/ranks/bronze.svg";
import diamond from "../../../assets/ranks/diamond.svg";
import emerald from "../../../assets/ranks/emerald.svg";
import gold from "../../../assets/ranks/gold.svg";
import iron from "../../../assets/ranks/iron.svg";
import master from "../../../assets/ranks/master.svg";
import platinum from "../../../assets/ranks/platinum.svg";
import silver from "../../../assets/ranks/silver.svg";
import type { Grade } from "./grading";
import { useStatsFormat } from "./statsFormat";

const EMBLEMES: Record<string, string> = {
  IRON: iron,
  BRONZE: bronze,
  SILVER: silver,
  GOLD: gold,
  PLATINUM: platinum,
  EMERALD: emerald,
  DIAMOND: diamond,
  MASTER_PLUS: master,
};

export interface LevelCrestProps {
  grade: Grade;
  position: string;
  patches: string[];
  /** Une partie isolée, ou la moyenne d'un joueur : la phrase du percentile n'est pas la même. */
  scope: "GAME" | "MEAN";
}

/** L'icône dit le niveau à l'échelle du ladder ; l'infobulle ajoute le percentile dans son propre palier. */
export function LevelCrest({
  grade,
  position,
  patches,
  scope,
}: LevelCrestProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const poste = format.poste(position);
  const palier = (tier: string) => t(`tier.${tier}`, { defaultValue: tier });

  const phrases = [
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
  ].filter(Boolean);

  return (
    <Tooltip title={phrases.join(" ")}>
      {grade.level ? (
        <img
          src={EMBLEMES[grade.level]}
          alt={palier(grade.level)}
          width={20}
          height={15}
        />
      ) : (
        <Text variant="caption" tone="secondary">
          {t("grade.short", { rank: Math.round((grade.inTier ?? 0) * 100) })}
        </Text>
      )}
    </Tooltip>
  );
}
