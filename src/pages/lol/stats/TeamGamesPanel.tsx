import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamGamesStatsApi } from "../../../api/statsApi";
import {
  Alert,
  Button,
  Card,
  Chip,
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
import { useLocaleFormat } from "../../../i18n/format";
import type {
  TeamGameDto,
  TeamGamesStatsDto,
  TeamRecordDto,
} from "../../../types/stats";
import { GameReviewDialog } from "../reviews/GameReviewDialog";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";
import { useWindowOptions } from "./windows";

export interface TeamGamesPanelProps {
  teamId: string;
}

/**
 * <strong>Panneau « équipe »</strong> — les parties où au moins quatre des membres ont joué,
 * toutes files confondues.
 *
 * <p>La file est affichée et comptée à part, jamais utilisée pour filtrer : une victoire en
 * normale draft ne vaut pas une victoire en flex, mais elle a bien eu lieu.</p>
 */
export function TeamGamesPanel({ teamId }: TeamGamesPanelProps) {
  const { t } = useTranslation("stats");
  const { t: tReviews } = useTranslation("reviews");
  const format = useStatsFormat();
  const { formatDate } = useLocaleFormat();
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

  const colonnes: Array<DataTableColumn<TeamGameDto>> = [
    {
      key: "date",
      header: t("games.date"),
      render: (game) =>
        game.startedAt ? formatDate(new Date(game.startedAt)) : format.absent,
    },
    {
      key: "result",
      header: t("games.result"),
      render: (game) =>
        game.win === null ? (
          <Chip label={t("games.split")} variant="outline" size="small" />
        ) : (
          <Chip
            label={game.win ? t("games.win") : t("games.loss")}
            tone={game.win ? "success" : "neutral"}
            size="small"
          />
        ),
    },
    {
      key: "queue",
      header: t("games.queue"),
      render: (game) => format.file(game.queueId),
    },
    {
      key: "present",
      header: t("games.present"),
      align: "right",
      render: (game) => t("games.presentCount", { count: game.presentPlayers }),
    },
    {
      key: "duration",
      header: t("games.duration"),
      align: "right",
      render: (game) => format.duree(game.durationSeconds),
    },
    {
      key: "side",
      header: t("games.side"),
      render: (game) =>
        game.players.length > 0
          ? format.cote(game.players[0].side)
          : format.absent,
    },
    {
      key: "champions",
      header: t("games.champions"),
      render: (game) => (
        <Stack direction="row" spacing={0.5} wrap>
          {game.players.map((player) => (
            <Chip
              key={`${game.matchId}-${player.memberId ?? player.championId}`}
              label={`${player.championName ?? player.championId} ${player.kills}/${player.deaths}/${player.assists}`}
              variant="outline"
              size="small"
            />
          ))}
        </Stack>
      ),
    },
    {
      key: "patch",
      header: t("games.patch"),
      render: (game) => game.patch ?? format.absent,
    },
    {
      key: "review",
      header: tReviews("action"),
      render: (game) => (
        <Button variant="ghost" size="small" onClick={() => setReviewed(game)}>
          {tReviews("action")}
        </Button>
      ),
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
                    label={format.file(Number(record.key))}
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

          <Card title={t("section.games")} disablePadding>
            <DataTable
              columns={colonnes}
              rows={stats.games}
              rowKey={(game) => game.matchId}
              caption={t("section.games")}
              emptyTitle={t("state.AUCUNE_PARTIE.title")}
              emptyDescription={t("state.AUCUNE_PARTIE.description")}
              dense
            />
          </Card>
        </>
      )}

      <GameReviewDialog
        teamId={teamId}
        game={reviewed}
        onClose={() => setReviewed(null)}
      />
    </Stack>
  );
}

const libelle = (
  record: TeamRecordDto,
  format: ReturnType<typeof useStatsFormat>,
) => `${format.taux(record.winRate)} · ${record.wins}-${record.losses}`;
