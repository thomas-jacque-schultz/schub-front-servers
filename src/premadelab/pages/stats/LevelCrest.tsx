import { useTranslation } from "react-i18next";
import {
  Chip,
  Stack,
  Text,
  Tooltip,
  VerdictMark,
  verdictOf,
} from "../../../common";
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
  /** Une mesure sans bon ni mauvais sens : pas de verdict. */
  neutral?: boolean;
}

/** L'icône du palier dont la valeur est la plus proche ; sans lui, sa place dans son propre palier. */
export function LevelCrest({
  grade,
  position,
  patches,
  scope,
  format,
  neutral = false,
}: LevelCrestProps) {
  const { t } = useTranslation("stats");
  const titre = useGradeTitle()(grade, position, patches, scope, format);
  if (!grade.level) {
    return (
      <PercentileMark
        value={grade.inTier ?? 0}
        title={titre}
        neutral={neutral}
        withLabel={false}
      />
    );
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
  neutral = false,
}: LevelCrestProps) {
  const { t } = useTranslation("stats");
  const titre = useGradeTitle()(grade, position, patches, scope, format);
  if (!grade.level) {
    return (
      <PercentileMark
        value={grade.inTier ?? 0}
        title={titre}
        neutral={neutral}
      />
    );
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

/** Une métrique qui ne suit pas le rang : son cran sur l'échelle unique (Schub#92), le pourcentage exact au survol. */
export function PercentileMark({
  value,
  title,
  neutral = false,
  withLabel = true,
}: {
  value: number;
  title: string;
  neutral?: boolean;
  /** Sans libellé dans une tuile étroite : il passe au survol, avec le pourcentage. */
  withLabel?: boolean;
}) {
  const { t } = useTranslation("stats");
  if (neutral) {
    return (
      <VerdictMark
        verdict={null}
        label={withLabel ? t("verdict.neutral") : undefined}
        title={`${withLabel ? "" : `${t("verdict.neutral")} : `}${t("verdict.neutralHint")} ${title}`}
      />
    );
  }
  const verdict = verdictOf(value);
  return (
    <VerdictMark
      verdict={verdict}
      label={withLabel ? t(`verdict.${verdict}`) : undefined}
      title={withLabel ? title : `${t(`verdict.${verdict}`)} : ${title}`}
    />
  );
}

/** Les moyennes du palier manquent encore : l'écran le dit, au lieu de laisser la place vide. */
export function MissingDataMark() {
  const { t } = useTranslation("stats");
  return (
    <Tooltip title={t("grade.missing")}>
      <Chip label={t("grade.missingShort")} variant="outline" />
    </Tooltip>
  );
}
