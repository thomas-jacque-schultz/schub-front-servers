import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getTeamGameDetailApi,
  getTeamGamesStatsApi,
} from "../../api/statsApi";
import { messageOf, useRequest } from "../../../api/useRequest";
import {
  Alert,
  Card,
  ProgressBar,
  SelectField,
  Stack,
  Text,
} from "../../../design-system";
import { GameReviews } from "../reviews/GameReviews";
import { GameDetail } from "./GameDetail";
import { GameHistoryList } from "./GameHistoryList";
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
  const [periode, setPeriode] = useState<string>("");
  const {
    data: stats,
    error,
    isLoading,
  } = useRequest(`${teamId}/${periode}`, () =>
    getTeamGamesStatsApi(teamId, periode),
  );

  if (isLoading && !stats) {
    return <ProgressBar label={t("loading")} />;
  }

  if (error !== null && !stats) {
    return <Alert severity="error">{messageOf(error, t("loadFailed"))}</Alert>;
  }

  if (!stats) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} align="center" wrap>
        <SelectField
          label={t("window.label")}
          value={periode}
          onChange={setPeriode}
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

      {error !== null && (
        <Alert severity="warning">{messageOf(error, t("loadFailed"))}</Alert>
      )}

      {stats.state !== "STATISTIQUES_CONNUES" ? (
        <StatsStateNote state={stats.state} variant="block" />
      ) : (
        <>
          {stats.truncated && (
            <Alert severity="info">{t("team.truncated")}</Alert>
          )}

          <Card
            title={t("section.games")}
            description={t("games.accordionHelper")}
          >
            <GameHistoryList
              games={stats.games}
              avatars={avatars}
              renderDetail={(game) => (
                <GameDetail
                  requestKey={`${teamId}/${game.matchId}/${periode}`}
                  load={() =>
                    getTeamGameDetailApi(teamId, game.matchId, periode)
                  }
                  avatars={avatars}
                  footer={<GameReviews teamId={teamId} game={game} />}
                />
              )}
            />
          </Card>
        </>
      )}
    </Stack>
  );
}
