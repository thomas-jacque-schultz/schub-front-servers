import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamOppositionApi } from "../../../api/statsApi";
import {
  Alert,
  Card,
  Columns,
  DataTable,
  type DataTableColumn,
  MeterBar,
  ProgressBar,
  SelectField,
  Stack,
  StatTile,
  Text,
} from "../../../design-system";
import type { PositionOppositionDto, TeamOppositionDto, TeamRecordDto } from "../../../types/stats";
import { useRankGapLabel } from "./rank";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";
import { useWindowOptions } from "./windows";

export interface OppositionPanelProps {
  teamId: string;
}

/** Le niveau adverse : où l'équipe gagne encore, et où elle bute. */
export function OppositionPanel({ teamId }: OppositionPanelProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const ecart = useRankGapLabel();
  const fenetres = useWindowOptions();
  const [days, setDays] = useState<string>("");
  const [dto, setDto] = useState<TeamOppositionDto | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setDto(await getTeamOppositionApi(teamId, days ? Number(days) : null));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [teamId, days, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading && !dto) {
    return <ProgressBar label={t("loading")} />;
  }
  if (error && !dto) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!dto) {
    return null;
  }

  const palier = (key: string) => t(`tier.${key}`, { defaultValue: key });
  const bilan = (record: TeamRecordDto) =>
    record.games === 0 ? format.absent : `${format.taux(record.winRate)} · ${record.wins}-${record.losses}`;

  const colonnes: Array<DataTableColumn<PositionOppositionDto>> = [
    { key: "position", header: t("detail.position"), width: 100, render: (l) => format.poste(l.position) },
    {
      key: "games",
      header: t("metricShort.games"),
      width: 80,
      align: "right",
      render: (l) => format.entier(l.games),
    },
    {
      key: "gap",
      header: t("opposition.averageGap"),
      width: 110,
      align: "right",
      render: (l) => ecart(l.averageGap),
    },
    {
      key: "stronger",
      header: t("opposition.versusStronger"),
      width: 150,
      align: "right",
      render: (l) => bilan(l.versusStronger),
    },
    {
      key: "weaker",
      header: t("opposition.versusWeaker"),
      width: 150,
      align: "right",
      render: (l) => bilan(l.versusWeaker),
    },
    {
      key: "lane",
      header: t("opposition.laneWon"),
      width: 150,
      align: "right",
      render: (l) =>
        l.laneGames === 0
          ? format.absent
          : `${format.taux(l.laneWinRate)} · ${t("coverage.gamesShort", { count: l.laneGames })}`,
    },
    {
      key: "gold",
      header: t("opposition.goldDiff15"),
      width: 110,
      align: "right",
      render: (l) =>
        l.averageGoldDiff15 === null
          ? format.absent
          : `${l.averageGoldDiff15 > 0 ? "+" : ""}${format.entier(l.averageGoldDiff15)}`,
    },
    {
      key: "cs",
      header: t("opposition.csDiff15"),
      width: 100,
      align: "right",
      render: (l) => format.ecartRatio(l.averageCsDiff15) ?? format.absent,
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} align="center" wrap>
        <SelectField
          label={t("window.label")}
          value={days}
          onChange={setDays}
          options={fenetres}
          helperText={t("window.helper")}
        />
        <Text variant="caption" tone="secondary">
          {t("opposition.intro")}
        </Text>
      </Stack>

      {error && <Alert severity="warning">{error}</Alert>}

      {dto.state !== "STATISTIQUES_CONNUES" && dto.state !== "INGESTION_EN_COURS" ? (
        <StatsStateNote state={dto.state} variant="block" />
      ) : dto.gamesWithRanks === 0 ? (
        <Alert severity="info">{t("opposition.pending")}</Alert>
      ) : (
        <>
          <Text variant="caption" tone="secondary">
            {dto.medianLagDays === null
              ? t("opposition.coverageNoLag", { withRanks: dto.gamesWithRanks, games: dto.games })
              : t("opposition.coverage", {
                  withRanks: dto.gamesWithRanks,
                  games: dto.games,
                  lag: Math.round(dto.medianLagDays),
                })}
          </Text>

          <Columns minWidth={300}>
            <Card title={t("opposition.ceiling")} description={t("opposition.ceilingHelper", { count: dto.ceilingMinimumGames })}>
              <StatTile
                label={t("opposition.title")}
                value={dto.ceilingTier ? palier(dto.ceilingTier) : format.absent}
                hint={
                  dto.ceilingTier
                    ? t("opposition.ceilingValue", { tier: palier(dto.ceilingTier) })
                    : t("opposition.ceilingNone", { count: dto.ceilingMinimumGames })
                }
              />
            </Card>
            <Card title={t("opposition.byGap")} description={t("opposition.byGapHelper")}>
              <Stack spacing={0.75}>
                {dto.byGap.map((record) => (
                  <MeterBar
                    key={record.key}
                    label={t(`opposition.gap.${record.key as "EVEN"}`)}
                    value={record.winRate}
                    valueLabel={bilan(record)}
                  />
                ))}
              </Stack>
            </Card>
            <Card title={t("opposition.byTier")} description={t("opposition.byTierHelper")}>
              <Stack spacing={0.75}>
                {dto.byEnemyTier.map((record) => (
                  <MeterBar
                    key={record.key}
                    label={palier(record.key)}
                    value={record.winRate}
                    valueLabel={bilan(record)}
                  />
                ))}
              </Stack>
            </Card>
          </Columns>

          <Card title={t("opposition.byPosition")} description={t("opposition.byPositionHelper")} disablePadding>
            <DataTable
              columns={colonnes}
              rows={dto.byPosition}
              rowKey={(ligne) => ligne.position}
              caption={t("opposition.byPosition")}
              emptyTitle={t("opposition.pending")}
              dense
              layout="fixed"
              minWidth={950}
            />
          </Card>
        </>
      )}
    </Stack>
  );
}
