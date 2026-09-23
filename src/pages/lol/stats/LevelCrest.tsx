import { useTranslation } from "react-i18next";
import { Stack, Text, Tooltip } from "../../../design-system";
import { EMBLEMES } from "./emblems";
import type { Grade } from "./grading";
import { useGradeTitle } from "./gradeTitle";

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
  const titre = useGradeTitle()(grade, position, patches, scope);
  const palier = (tier: string) => t(`tier.${tier}`, { defaultValue: tier });

  return (
    <Tooltip title={titre}>
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

/** L'icône suivie du nom du palier : le rang auquel correspond la valeur, lisible sans survol. */
export function GradeLabel({
  grade,
  position,
  patches,
  scope,
}: LevelCrestProps) {
  const { t } = useTranslation("stats");
  const titre = useGradeTitle()(grade, position, patches, scope);
  if (!grade.level) {
    return <PercentileMark value={grade.inTier ?? 0} title={titre} />;
  }
  const palier = t(`tier.${grade.level}`, { defaultValue: grade.level });
  return (
    <Tooltip title={titre}>
      <Stack direction="row" spacing={0.5} align="center">
        <img src={EMBLEMES[grade.level]} alt="" width={20} height={15} />
        <Text variant="caption">{palier}</Text>
      </Stack>
    </Tooltip>
  );
}

/** Sans échelle du ladder (champion, groupe trop mince) : le percentile seul, expliqué au survol. */
export function PercentileMark({
  value,
  title,
}: {
  value: number;
  title: string;
}) {
  const { t } = useTranslation("stats");
  return (
    <Tooltip title={title}>
      <Text variant="caption" tone="secondary">
        {t("grade.short", { rank: Math.round(value * 100) })}
      </Text>
    </Tooltip>
  );
}
