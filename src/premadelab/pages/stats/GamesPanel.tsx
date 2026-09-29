import { useTranslation } from "react-i18next";
import {
  Alert,
  Card,
  ProgressBar,
  Stack,
  messageOf,
  useRequest,
} from "../../../common";
import { GameDetail } from "./GameDetail";
import { GameHistoryList } from "./GameHistoryList";
import { StatsStateNote } from "./StatsStateNote";
import type { FindingDto } from "../../types/findings";
import type { MyGamesDto, TeamGameDetailDto } from "../../types/stats";

export interface GamesPanelProps {
  /** Clé de cache : change avec le joueur et la période. */
  requestKey: string;
  load: () => Promise<MyGamesDto>;
  loadDetail: (matchId: string) => Promise<TeamGameDetailDto>;
  loadFindings?: (matchId: string) => Promise<FindingDto[]>;
  avatar: string | null;
  /** Titre de l'accordéon des stats détaillées du joueur, dans chaque partie. */
  detailTitle: string;
}

/** Toutes les parties d'un joueur, toutes files confondues, comme l'historique d'une équipe dont il serait le seul membre. */
export function GamesPanel({
  requestKey,
  load,
  loadDetail,
  loadFindings,
  avatar,
  detailTitle,
}: GamesPanelProps) {
  const { t } = useTranslation("stats");
  const { data: historique, error, isLoading } = useRequest(requestKey, load);

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
              requestKey={`${requestKey}/${game.matchId}`}
              load={() => loadDetail(game.matchId)}
              loadFindings={
                loadFindings ? () => loadFindings(game.matchId) : undefined
              }
              avatars={avatars}
              subjectTitle={detailTitle}
            />
          )}
        />
      </Card>
    </Stack>
  );
}
