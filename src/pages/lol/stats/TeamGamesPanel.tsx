import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamGamesStatsApi } from "../../../api/statsApi";
import { Alert, Card, ProgressBar, SelectField, Stack, Text } from "../../../design-system";
import type { TeamGameDto, TeamGamesStatsDto } from "../../../types/stats";
import { GameDetailDialog } from "./GameDetailDialog";
import { TeamGameRow } from "./TeamGameRow";
import { StatsStateNote } from "./StatsStateNote";
import { useWindowOptions } from "./windows";

export interface TeamGamesPanelProps {
  teamId: string;
  /** Les avatars de l'effectif, par place : une partie ne les porte pas. */
  avatars: Record<string, string | null>;
}

export function TeamGamesPanel({ teamId, avatars }: TeamGamesPanelProps) {
  const { t } = useTranslation("stats");
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
      setError(loadError instanceof Error ? loadError.message : t("loadFailed"));
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
          {stats.truncated && <Alert severity="info">{t("team.truncated")}</Alert>}

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
