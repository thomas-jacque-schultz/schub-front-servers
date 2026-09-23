import { useTranslation } from "react-i18next";
import { getMyGameDetailApi, getMyGamesApi } from "../../../api/statsApi";
import { messageOf, useRequest } from "../../../api/useRequest";
import { Alert, Card, ProgressBar, Stack } from "../../../design-system";
import { GameDetail } from "./GameDetail";
import { GameHistoryList } from "./GameHistoryList";
import { StatsStateNote } from "./StatsStateNote";

export interface MyGamesPanelProps {
  periode: string;
  avatar: string | null;
}

/** Toutes mes parties, toutes files confondues, comme l'historique d'une équipe dont je serais le seul membre. */
export function MyGamesPanel({ periode, avatar }: MyGamesPanelProps) {
  const { t } = useTranslation("stats");
  const {
    data: historique,
    error,
    isLoading,
  } = useRequest(`me/${periode}`, () => getMyGamesApi(periode));

  if (isLoading && !historique) {
    return <ProgressBar label={t("loading")} />;
  }
  if (error !== null && !historique) {
    return <Alert severity="error">{messageOf(error, t("loadFailed"))}</Alert>;
  }
  if (!historique) {
    return null;
  }
  if (historique.state !== "STATISTIQUES_CONNUES") {
    return <StatsStateNote state={historique.state} variant="block" />;
  }

  const avatars: Record<string, string | null> = historique.viewerMemberId
    ? { [historique.viewerMemberId]: avatar }
    : {};

  return (
    <Stack spacing={2}>
      {error !== null && (
        <Alert severity="warning">{messageOf(error, t("loadFailed"))}</Alert>
      )}
      {historique.truncated && (
        <Alert severity="info">
          {t("history.truncated", {
            count: historique.games.length,
            total: historique.totalGames,
          })}
        </Alert>
      )}
      <Card title={t("history.title")} description={t("history.helper")}>
        <GameHistoryList
          games={historique.games}
          avatars={avatars}
          showPresence={false}
          renderDetail={(game) => (
            <GameDetail
              requestKey={`me/${game.matchId}/${periode}`}
              load={() => getMyGameDetailApi(game.matchId, periode)}
              avatars={avatars}
            />
          )}
        />
      </Card>
    </Stack>
  );
}
