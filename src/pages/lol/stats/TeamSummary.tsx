import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamGamesStatsApi } from "../../../api/statsApi";
import {
  Alert,
  Card,
  Columns,
  MeterBar,
  ProgressBar,
  Stack,
  StatTile,
  Text,
} from "../../../design-system";
import type { TeamGamesStatsDto, TeamRecordDto } from "../../../types/stats";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";

export interface TeamSummaryProps {
  teamId: string;
  days: string;
}

/** Le bilan des parties d'équipe : taux de victoire, files, côtés, patchs et présence. */
export function TeamSummary({ teamId, days }: TeamSummaryProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const [stats, setStats] = useState<TeamGamesStatsDto | null>(null);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setError("");
    try {
      setStats(await getTeamGamesStatsApi(teamId, days ? Number(days) : null));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("loadFailed"));
    }
  }, [teamId, days, t]);

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
        {t("team.definition", { count: stats.minimumPlayers, roster: stats.rosterSize })}
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

          <Columns minWidth={260}>
            <Card title={t("section.byQueue")} description={t("section.byQueueHelper")}>
              <Stack spacing={0.75}>
                {stats.byQueue.map((record) => (
                  <MeterBar
                    key={record.key}
                    label={format.file(record.key)}
                    value={record.winRate}
                    valueLabel={libelle(record, format)}
                  />
                ))}
              </Stack>
            </Card>
            <Card title={t("section.bySide")}>
              <Stack spacing={0.75}>
                {stats.bySide.map((record) => (
                  <MeterBar
                    key={record.key}
                    label={format.cote(Number(record.key))}
                    value={record.winRate}
                    valueLabel={libelle(record, format)}
                  />
                ))}
              </Stack>
            </Card>
            <Card title={t("section.byPatch")}>
              <Stack spacing={0.75}>
                {stats.byPatch.map((record) => (
                  <MeterBar
                    key={record.key}
                    label={record.key || format.absent}
                    value={record.winRate}
                    valueLabel={libelle(record, format)}
                  />
                ))}
              </Stack>
            </Card>
          </Columns>

          <Card title={t("section.presence")} description={t("section.presenceHelper")}>
            <Stack spacing={0.75}>
              {stats.presence.map((member) => (
                <Stack key={member.memberId} spacing={0}>
                  <MeterBar
                    label={member.displayName ?? member.memberId}
                    value={member.presenceRate}
                    valueLabel={t("team.presenceValue", {
                      rate: format.taux(member.presenceRate),
                      count: member.games,
                    })}
                    hint={
                      member.games > 0
                        ? t("team.memberWinRate", {
                            rate: format.taux(member.winRate),
                          })
                        : undefined
                    }
                  />
                  <StatsStateNote state={member.state} />
                </Stack>
              ))}
            </Stack>
          </Card>
        </>
      )}
    </Stack>
  );
}

const libelle = (record: TeamRecordDto, format: ReturnType<typeof useStatsFormat>) =>
  `${format.taux(record.winRate)} · ${record.wins}-${record.losses}`;
