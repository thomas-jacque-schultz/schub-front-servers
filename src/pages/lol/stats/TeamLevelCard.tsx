import { useTranslation } from "react-i18next";
import { Card, Stack, StatGrid, Text, Tooltip } from "../../../design-system";
import type { TeamLevelDto, TeamLevelMetricDto } from "../../../types/stats";
import { EMBLEMES } from "./emblems";
import { PercentileMark } from "./LevelCrest";
import { useStatsFormat } from "./statsFormat";

const ENTIERS = new Set(["goldDiffAt15", "xpDiffAt15"]);

export function TeamLevelCard({ level }: { level: TeamLevelDto | null }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  if (!level || level.games === 0) {
    return (
      <Card title={t("teamLevel.title")} description={t("teamLevel.helper")}>
        <Text variant="caption" tone="secondary">
          {t("teamLevel.empty")}
        </Text>
      </Card>
    );
  }

  const valeur = (metrique: TeamLevelMetricDto) => {
    if (metrique.mean === null) {
      return format.absent;
    }
    const signe =
      metrique.key.endsWith("DiffAt15") && metrique.mean > 0 ? "+" : "";
    return (
      signe +
      (ENTIERS.has(metrique.key)
        ? format.entier(metrique.mean)
        : format.ratio(metrique.mean))
    );
  };

  const marque = (metrique: TeamLevelMetricDto) => {
    if (metrique.inTier === null) {
      return undefined;
    }
    const phrase = t("grade.team", {
      games: metrique.games,
      rank: Math.round(metrique.inTier * 100),
    });
    if (!metrique.level) {
      return <PercentileMark value={metrique.inTier} title={phrase} />;
    }
    const palier = t(`tier.${metrique.level}`, {
      defaultValue: metrique.level,
    });
    return (
      <Tooltip title={`${phrase} ${t("grade.teamLevel", { tier: palier })}`}>
        <img
          src={EMBLEMES[metrique.level]}
          alt={palier}
          width={20}
          height={15}
        />
      </Tooltip>
    );
  };

  return (
    <Card title={t("teamLevel.title")} description={t("teamLevel.helper")}>
      <Stack spacing={1.5}>
        <StatGrid
          minWidth={150}
          items={level.metrics.map((metrique) => ({
            key: metrique.key,
            label: t(`teamLevel.metric.${metrique.key}`, {
              defaultValue: metrique.key,
            }),
            value: valeur(metrique),
            adornment: marque(metrique),
          }))}
        />
        <Text variant="caption" tone="secondary">
          {t("teamLevel.basis", {
            games: level.games,
            tier: level.tier
              ? t(`tier.${level.tier}`, { defaultValue: level.tier })
              : format.absent,
          })}
        </Text>
      </Stack>
    </Card>
  );
}
