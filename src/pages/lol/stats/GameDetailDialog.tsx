import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamGameDetailApi } from "../../../api/statsApi";
import {
  Alert,
  ChampionSlot,
  Chip,
  DataTable,
  type DataTableColumn,
  Dialog,
  Divider,
  ProgressBar,
  Stack,
  Text,
} from "../../../design-system";
import { useLocaleFormat } from "../../../i18n/format";
import type {
  MatchupDto,
  TeamGameDetailDto,
  TeamGameDto,
  TeamGamePlayerDto,
} from "../../../types/stats";
import { GameReviews } from "../reviews/GameReviews";
import { useRankGap, useRankLabel } from "./rank";
import { useStatsFormat } from "./statsFormat";

export interface GameDetailDialogProps {
  teamId: string;
  game: TeamGameDto | null;
  avatars: Record<string, string | null>;
  onClose: () => void;
}

const QUINZE = 15;

export function GameDetailDialog({ teamId, game, avatars, onClose }: GameDetailDialogProps) {
  const { t } = useTranslation("stats");
  const { formatDate } = useLocaleFormat();
  const [detail, setDetail] = useState<TeamGameDetailDto | null>(null);
  const [error, setError] = useState<string>("");

  const matchId = game?.matchId;

  useEffect(() => {
    setDetail(null);
    setError("");
    if (!matchId) {
      return;
    }
    let vivant = true;
    getTeamGameDetailApi(teamId, matchId)
      .then((reponse) => vivant && setDetail(reponse))
      .catch(
        (loadError) =>
          vivant &&
          setError(loadError instanceof Error ? loadError.message : t("detail.loadFailed")),
      );
    return () => {
      vivant = false;
    };
  }, [teamId, matchId, t]);

  return (
    <Dialog
      open={game !== null}
      title={
        game?.startedAt
          ? t("detail.title", { date: formatDate(new Date(game.startedAt)) })
          : t("games.detail")
      }
      cancelLabel={t("detail.close")}
      onClose={onClose}
      maxWidth="lg"
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {!detail && !error && <ProgressBar label={t("loading")} />}
        {detail && <FaceAFace detail={detail} avatars={avatars} />}
        {game && (
          <>
            <Divider />
            <GameReviews teamId={teamId} game={game} />
          </>
        )}
      </Stack>
    </Dialog>
  );
}

function FaceAFace({
  detail,
  avatars,
}: {
  detail: TeamGameDetailDto;
  avatars: Record<string, string | null>;
}) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const rang = useRankLabel();
  const ecartDeRang = useRankGap();

  if (detail.matchups.length === 0) {
    return <Alert severity="info">{t("detail.noMatchups")}</Alert>;
  }

  const minutes = detail.game.durationSeconds / 60;
  const signe = (valeur: number) => `${valeur > 0 ? "+" : ""}${format.entier(valeur)}`;
  const kda = (j: TeamGamePlayerDto) => `${j.kills}/${j.deaths}/${j.assists}`;
  const partieEntiere = (j: TeamGamePlayerDto) =>
    minutes > 0
      ? `${kda(j)} · ${format.entier(j.damageToChampions / minutes)} ${t("metricShort.dpm")} · ${format.entier(
          j.goldEarned / minutes,
        )} ${t("metricShort.gold")}`
      : kda(j);

  const cote = (joueur: TeamGamePlayerDto | null, allie: boolean) =>
    joueur ? (
      <Stack direction="row" spacing={1} align="center">
        <ChampionSlot
          championName={joueur.championName ?? String(joueur.championId)}
          championIcon={joueur.iconUrl}
          playerName={allie ? (joueur.displayName ?? t("games.outsider")) : null}
          playerAvatar={allie && joueur.memberId ? avatars[joueur.memberId] : null}
          size="small"
        />
        <Stack spacing={0}>
          <Text variant="caption" mono>
            {partieEntiere(joueur)}
          </Text>
          <Text variant="caption" tone="secondary">
            {rang(joueur.soloRank ?? joueur.flexRank)}
          </Text>
        </Stack>
      </Stack>
    ) : (
      <Text tone="disabled">{format.absent}</Text>
    );

  const gap = (valeur: number | null) => {
    const ecart = ecartDeRang(valeur);
    return ecart ? (
      <Chip label={ecart.label} tone={ecart.tone} variant="outline" size="small" />
    ) : (
      <Text tone="disabled">{format.absent}</Text>
    );
  };

  const a15 = (ligne: MatchupDto) => {
    const nous = ligne.ally?.at15;
    const eux = ligne.enemy?.at15;
    if (!nous || !eux) {
      return <Text tone="disabled">{format.absent}</Text>;
    }
    const ecart = (valeur: number) => (valeur > 0 ? "success" : valeur < 0 ? "error" : "neutral");
    const or = nous.gold - eux.gold;
    const cs = nous.cs - eux.cs;
    // Le jungler n'a pas de couloir : ses ganks réussis remplacent l'état de la lane.
    const jungle = ligne.position === "JUNGLE";
    const reussis = nous.ganksSucceeded;
    const subis = nous.ganksSuffered;
    return (
      <Stack spacing={0.25}>
        <Stack direction="row" spacing={0.5} wrap>
          {!jungle && (
            <>
              <Chip
                label={`${t("detail.goldDiff")} ${signe(or)}`}
                tone={ecart(or)}
                variant="outline"
                size="small"
              />
              <Chip
                label={`${t("detail.csDiff")} ${signe(cs)}`}
                tone={ecart(cs)}
                variant="outline"
                size="small"
              />
            </>
          )}
          {reussis !== null && (
            <Chip
              label={t("detail.ganksSucceeded", { count: reussis })}
              tone={reussis > 0 ? "success" : "neutral"}
              variant="outline"
              size="small"
            />
          )}
          {!jungle && subis !== null && (
            <Chip
              label={t("detail.ganksSuffered", { count: subis })}
              tone={subis > 0 ? "error" : "success"}
              variant="outline"
              size="small"
            />
          )}
        </Stack>
        <Text variant="caption" tone="secondary" mono>
          {`${t("detail.kdaAt15")} ${nous.kills}/${nous.deaths}/${nous.assists} – ${eux.kills}/${eux.deaths}/${eux.assists}`}
        </Text>
        <Text variant="caption" tone="secondary" mono>
          {`${t("detail.dpmAt15")} ${format.entier(nous.damageToChampions / QUINZE)} – ${format.entier(
            eux.damageToChampions / QUINZE,
          )}`}
        </Text>
      </Stack>
    );
  };

  const colonnes: Array<DataTableColumn<MatchupDto>> = [
    {
      key: "position",
      header: t("detail.position"),
      width: 90,
      render: (l) => format.poste(l.position),
    },
    { key: "ally", header: t("detail.ally"), width: 290, render: (l) => cote(l.ally, true) },
    {
      key: "gap",
      header: t("detail.gap"),
      width: 130,
      align: "right",
      render: (l) => gap(l.rankGap),
    },
    { key: "enemy", header: t("detail.enemy"), width: 290, render: (l) => cote(l.enemy, false) },
    { key: "at15", header: t("detail.at15"), width: 280, render: a15 },
  ];

  return (
    <Stack spacing={1}>
      <Text variant="section">{t("detail.matchups")}</Text>
      <Text variant="caption" tone="secondary">
        {t("detail.matchupsHelper")}
      </Text>
      {!detail.timelineAvailable ? (
        <Alert severity="info">{t("detail.noTimeline")}</Alert>
      ) : (
        detail.game.durationSeconds < QUINZE * 60 && (
          <Alert severity="info">{t("detail.shortGame")}</Alert>
        )
      )}
      <DataTable
        columns={colonnes}
        rows={detail.matchups}
        rowKey={(ligne) => ligne.position}
        caption={t("detail.matchups")}
        emptyTitle={t("detail.noMatchups")}
        dense
        layout="fixed"
        minWidth={1070}
      />
    </Stack>
  );
}
