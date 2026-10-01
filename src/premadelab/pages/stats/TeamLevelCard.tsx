import { useTranslation } from "react-i18next";
import { Card, DataTable, Stack, Text, Tooltip } from "../../../common";
import type { TeamLevelDto, TeamLevelMetricDto } from "../../types/stats";
import { EMBLEMES } from "./emblems";
import { PercentileMark } from "./LevelCrest";
import { useStatsFormat } from "./statsFormat";

const ENTIERS = new Set(["goldDiffAt15", "xpDiffAt15"]);
const ECARTS = new Set(["goldDiffAt15", "xpDiffAt15", "killsDiffAt15"]);

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

  const chiffre = (
    metrique: TeamLevelMetricDto,
    valeur: number | null,
    signe: boolean,
  ) => {
    if (valeur === null) {
      return format.absent;
    }
    return (
      (signe && valeur > 0 ? "+" : "") +
      (ENTIERS.has(metrique.key) ? format.entier(valeur) : format.ratio(valeur))
    );
  };

  const marque = (metrique: TeamLevelMetricDto) => {
    if (metrique.inTier === null) {
      return null;
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

  const aLaFin = Math.max(0, ...level.metrics.map((m) => m.gamesAtEnd));

  return (
    <Card title={t("teamLevel.title")} description={t("teamLevel.helper")}>
      <Stack spacing={1.5}>
        <DataTable<TeamLevelMetricDto>
          dense
          caption={t("teamLevel.title")}
          emptyTitle={t("teamLevel.empty")}
          rows={level.metrics}
          rowKey={(m) => m.key}
          layout="fixed"
          minWidth={560}
          columns={[
            {
              key: "metric",
              header: t("teamLevel.metricHeader"),
              width: 200,
              render: (m) =>
                t(`teamLevel.metric.${m.key}`, { defaultValue: m.key }),
            },
            {
              key: "at15",
              header: t("teamLevel.at15"),
              width: 130,
              align: "right",
              render: (m) => (
                <Stack
                  direction="row"
                  spacing={0.75}
                  align="center"
                  justify="end"
                >
                  {marque(m)}
                  <Text mono>{chiffre(m, m.mean, ECARTS.has(m.key))}</Text>
                </Stack>
              ),
            },
            {
              key: "atEnd",
              header: t("teamLevel.atEnd"),
              width: 110,
              align: "right",
              render: (m) => (
                <Text mono>{chiffre(m, m.meanAtEnd, ECARTS.has(m.key))}</Text>
              ),
            },
            {
              key: "change",
              header: t("teamLevel.change"),
              width: 110,
              align: "right",
              render: (m) => (
                <Text
                  mono
                  tone={m.meanChange === null ? "disabled" : "default"}
                >
                  {chiffre(m, m.meanChange, true)}
                </Text>
              ),
            },
          ]}
        />
        <Text variant="caption" tone="secondary">
          {t("teamLevel.basis", {
            games: level.games,
            tier: level.tier
              ? t(`tier.${level.tier}`, { defaultValue: level.tier })
              : format.absent,
          })}
        </Text>
        {aLaFin < level.games && (
          <Text variant="caption" tone="secondary">
            {t("teamLevel.endPending", { count: aLaFin, games: level.games })}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
