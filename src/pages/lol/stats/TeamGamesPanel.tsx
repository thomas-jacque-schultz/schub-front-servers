import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamGamesStatsApi } from "../../../api/statsApi";
import {
  Alert,
  Card,
  Columns,
  MeterBar,
  ProgressBar,
  SelectField,
  Stack,
  StatTile,
  Text,
} from "../../../design-system";
import type {
  TeamGameDto,
  TeamGamesStatsDto,
  TeamRecordDto,
} from "../../../types/stats";
import { GameDetailDialog } from "./GameDetailDialog";
import { TeamGameRow } from "./TeamGameRow";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";
import { useWindowOptions } from "./windows";

export interface TeamGamesPanelProps {
  teamId: string;
  /** Les avatars de l'effectif, par place : une partie ne les porte pas. */
  avatars: Record<string, string | null>;
}

export function TeamGamesPanel({ teamId, avatars }: TeamGamesPanelProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const fenetres = useWindowOptions();
  const [days, setDays] = useState<string>("");
  const [stats, setStats] = useState<TeamGamesStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [reviewed, setReviewed] = useState<TeamGameDto | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setStats(await getTeamGamesStatsApi(teamId, days ? Number(days) : null));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("loadFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [teamId, days, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading && !stats) {
    return <ProgressBar label={t("loading")} />;
  }

  if (error && !stats) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return null;
  }

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
          {t("team.definition", {
            count: stats.minimumPlayers,
            roster: stats.rosterSize,
          })}
        </Text>
      </Stack>

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

          {stats.truncated && (
            <Alert severity="info">{t("team.truncated")}</Alert>
          )}

          <Columns minWidth={260}>
            <Card
              title={t("section.byQueue")}
              description={t("section.byQueueHelper")}
            >
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

          <Card
            title={t("section.presence")}
            description={t("section.presenceHelper")}
          >
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

          <Card title={t("section.games")}>
            <Stack spacing={1}>
              {stats.games.map((game) => (
                <TeamGameRow
                  key={game.matchId}
                  game={game}
                  avatars={avatars}
                  onOpen={() => setReviewed(game)}
                />
              ))}
            </Stack>
          </Card>
        </>
      )}

      <GameDetailDialog
        teamId={teamId}
        game={reviewed}
        avatars={avatars}
        onClose={() => setReviewed(null)}
      />
    </Stack>
  );
}

const libelle = (
  record: TeamRecordDto,
  format: ReturnType<typeof useStatsFormat>,
) => `${format.taux(record.winRate)} · ${record.wins}-${record.losses}`;
