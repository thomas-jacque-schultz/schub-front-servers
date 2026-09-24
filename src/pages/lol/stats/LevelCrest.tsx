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
  /** Met en forme une valeur de la métrique : les moyennes de l'infobulle se lisent dans son unité. */
  format: (value: number) => string;
}

/** L'icône du palier dont la valeur est la plus proche ; sans lui, sa place dans son propre palier. */
export function LevelCrest({
  grade,
  position,
  patches,
  scope,
  format,
}: LevelCrestProps) {
  const { t } = useTranslation("stats");
  const titre = useGradeTitle()(grade, position, patches, scope, format);
  if (!grade.level) {
    return <PercentileMark value={grade.inTier ?? 0} title={titre} />;
  }
  return (
    <Tooltip title={titre}>
      <img
        src={EMBLEMES[grade.level]}
        alt={t(`tier.${grade.level}`, { defaultValue: grade.level })}
        width={20}
        height={15}
      />
    </Tooltip>
  );
}

/** L'icône suivie du nom du palier : le rang auquel correspond la valeur, lisible sans survol. */
export function GradeLabel({
  grade,
  position,
  patches,
  scope,
  format,
}: LevelCrestProps) {
  const { t } = useTranslation("stats");
  const titre = useGradeTitle()(grade, position, patches, scope, format);
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

/** Une métrique qui ne suit pas le rang : la part des joueurs de son palier qui font moins bien, en « top x % ». */
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
        {t("grade.short", { top: Math.max(1, Math.round((1 - value) * 100)) })}
      </Text>
    </Tooltip>
  );
}
