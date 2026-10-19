import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamGamesStatsApi } from "../../api/statsApi";
import {
  Alert,
  Card,
  Columns,
  LaneMap,
  MeterBar,
  ProgressBar,
  RingGauges,
  Stack,
  StatTile,
  Text,
  TrendChart,
} from "../../../common";
import type { TeamGamesStatsDto, TeamRecordDto } from "../../types/stats";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";
import { QueuePie } from "./QueuePie";

export interface TeamSummaryProps {
  teamId: string;
  periode: string;
}

/** Le bilan des parties d'équipe : taux de victoire, files, côtés, patchs et présence. */
export function TeamSummary({ teamId, periode }: TeamSummaryProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const [stats, setStats] = useState<TeamGamesStatsDto | null>(null);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setError("");
    try {
      setStats(await getTeamGamesStatsApi(teamId, periode));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("loadFailed"),
      );
    }
  }, [teamId, periode, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error && !stats) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!stats) {
    return <ProgressBar label={t("loading")} />;
  }

  return (
    <Stack spacing={2}>
      <Text variant="caption" tone="secondary">
        {t("team.definition", {
          count: stats.minimumPlayers,
          roster: stats.rosterSize,
        })}
      </Text>
      {error && <Alert severity="warning">{error}</Alert>}
      {stats.state !== "STATISTIQUES_CONNUES" ? (
        <StatsStateNote state={stats.state} variant="block" />
      ) : (
        <>
          <Columns minWidth={220}>
            <Card>
              <MeterBar
                label={t("metric.winRate")}
                value={stats.overall.winRate}
                valueLabel={format.taux(stats.overall.winRate)}
                hint={
                  format.periode(stats.firstPlayedAt, stats.lastPlayedAt) ??
                  t("coverage.games", { count: stats.overall.games })
                }
              />
            </Card>
            <Card>
              <StatTile
                label={t("team.games")}
                value={format.entier(stats.overall.games)}
                hint={t("team.gamesHint", {
                  total: stats.totalGames,
                  undecided: stats.undecidedGames,
                })}
              />
            </Card>
            <Card>
              <StatTile
                label={t("team.averageDuration")}
                value={format.duree(stats.overall.averageDurationSeconds)}
              />
            </Card>
          </Columns>

          <Columns minWidth={260} count={4}>
            <Card
              title={t("section.byQueue")}
              footnote={t("section.byQueueHelper")}
            >
              <QueuePie queues={stats.byQueue} label={t("queuePie.label")} />
            </Card>
            <Card title={t("section.bySide")}>
              <LaneMap
                align="center"
                label={t("section.bySideMap", {
                  average: format.taux(stats.overall.winRate),
                })}
                zones={stats.bySide.map((record) => ({
                  key: Number(record.key) === 200 ? "RED" : "BLUE",
                  label: format.cote(Number(record.key)),
                  value: record.games,
                  valueLabel: libelle(record, format),
                  ...teinte(record, stats.overall.winRate),
                }))}
              />
            </Card>
            <Card title={t("section.byPatch")}>
              <TrendChart
                label={t("metric.winRate")}
                valueHeader={t("metric.winRate")}
                emptyLabel={t("section.noPatch")}
                scaleMax={1}
                reference={stats.overall.winRate}
                referenceLabel={t("section.trendReferenceTeam", {
                  value: format.taux(stats.overall.winRate),
                })}
                points={[...stats.byPatch]
                  .sort((a, b) =>
                    a.key.localeCompare(b.key, undefined, { numeric: true }),
                  )
                  .map((record) => ({
                    key: record.key,
                    label: record.key || format.absent,
                    value: record.winRate,
                    valueLabel: format.taux(record.winRate),
                    muted: record.games < PARTIES_LISIBLES,
                    title: `${record.key} · ${libelle(record, format)}`,
                  }))}
              />
            </Card>
            <Card
              title={t("section.presence")}
              footnote={t("section.presenceHelper")}
            >
              <RingGauges
                label={t("section.presenceRings")}
                items={stats.presence.map((member) => ({
                  key: member.memberId,
                  label: member.displayName ?? member.memberId,
                  value: member.presenceRate,
                  valueLabel: format.taux(member.presenceRate),
                  detail:
                    member.state !== "STATISTIQUES_CONNUES"
                      ? t(`state.${member.state}.short`)
                      : t("team.presenceDetail", {
                          count: member.games,
                          rate: format.taux(member.winRate),
                        }),
                }))}
              />
            </Card>
          </Columns>
        </>
      )}
    </Stack>
  );
}

// En deçà, un côté reste gris : trop peu de parties pour le comparer.
const PARTIES_LISIBLES = 3;
const ECART_NEUTRE = 0.03;
const ECART_SATURE = 0.2;

const teinte = (
  record: TeamRecordDto,
  moyenne: number | null,
): {
  tone: "positive" | "negative" | "neutral" | "empty";
  strength: number;
} => {
  if (
    record.games < PARTIES_LISIBLES ||
    record.winRate === null ||
    moyenne === null
  ) {
    return { tone: "empty", strength: 0 };
  }
  const ecart = record.winRate - moyenne;
  return {
    tone:
      ecart > ECART_NEUTRE
        ? "positive"
        : ecart < -ECART_NEUTRE
          ? "negative"
          : "neutral",
    strength: Math.abs(ecart) / ECART_SATURE,
  };
};

const libelle = (
  record: TeamRecordDto,
  format: ReturnType<typeof useStatsFormat>,
) => `${format.taux(record.winRate)} · ${record.wins}-${record.losses}`;
