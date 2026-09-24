import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { messageOf, useRequest } from "../../../api/useRequest";
import {
  Alert,
  ChampionSlot,
  Chip,
  DataTable,
  type DataTableColumn,
  Divider,
  ProgressBar,
  Stack,
  Text,
} from "../../../design-system";
import type {
  GamePlayerMetricsDto,
  MatchupDto,
  TeamGameDetailDto,
  TeamGamePlayerDto,
} from "../../types/stats";
import { EarlyGameView } from "./EarlyGameView";
import { PlayerGameDialog } from "./PlayerGameDialog";
import { useRankGap, useRankLabel } from "./rank";
import { useStatsFormat } from "./statsFormat";

export interface GameDetailProps {
  /** Change quand la partie ou la période change : c'est elle qui relance le chargement. */
  requestKey: string;
  load: () => Promise<TeamGameDetailDto>;
  avatars: Record<string, string | null>;
  /** Sous le détail : les notes de revue d'une partie d'équipe. */
  footer?: ReactNode;
}

const QUINZE = 15;
// En deçà de 500 pièces d'or d'écart à 15 minutes, le couloir est tenu pour égal.
const SEUIL_OR = 500;

export function GameDetail({
  requestKey,
  load,
  avatars,
  footer,
}: GameDetailProps) {
  const { t } = useTranslation("stats");
  const { data: detail, error, isLoading } = useRequest(requestKey, load);
  const [choisi, setChoisi] = useState<TeamGamePlayerDto | null>(null);

  const indicateurs = (
    joueur: TeamGamePlayerDto | null,
  ): GamePlayerMetricsDto | null =>
    joueur && detail
      ? (detail.metrics.find(
          (ligne) =>
            ligne.side === joueur.side &&
            ligne.championId === joueur.championId,
        ) ?? null)
      : null;

  return (
    <Stack spacing={2}>
      {error !== null && (
        <Alert severity="error">
          {messageOf(error, t("detail.loadFailed"))}
        </Alert>
      )}
      {isLoading && !detail && <ProgressBar label={t("loading")} />}
      {detail && (
        <>
          <Text variant="caption" tone="secondary">
            {t("detail.playerHint")}
          </Text>
          {detail.matchups.length > 0 ? (
            <FaceAFace detail={detail} avatars={avatars} onPick={setChoisi} />
          ) : (
            <TousLesJoueurs
              detail={detail}
              avatars={avatars}
              onPick={setChoisi}
            />
          )}
        </>
      )}
      {detail?.early && (
        <>
          <Divider />
          <EarlyGameView
            early={detail.early}
            names={Object.fromEntries(
              detail.game.players.flatMap((membre) =>
                membre.memberId && membre.displayName
                  ? [[membre.memberId, membre.displayName]]
                  : [],
              ),
            )}
          />
        </>
      )}
      {detail && detail.timelineAvailable && !detail.early && (
        <Alert severity="info">{t("early.noAnalysis")}</Alert>
      )}
      {footer && (
        <>
          <Divider />
          {footer}
        </>
      )}
      <PlayerGameDialog
        player={choisi}
        metrics={indicateurs(choisi)}
        avatar={choisi?.memberId ? avatars[choisi.memberId] : null}
        onClose={() => setChoisi(null)}
      />
    </Stack>
  );
}

interface JoueursProps {
  detail: TeamGameDetailDto;
  avatars: Record<string, string | null>;
  onPick: (joueur: TeamGamePlayerDto) => void;
}

// ARAM, Arène, ou membres dans les deux camps : pas de face-à-face, mais chaque joueur reste consultable.
function TousLesJoueurs({ detail, avatars, onPick }: JoueursProps) {
  const { t } = useTranslation("stats");
  const camps = [
    [...detail.game.players, ...detail.game.allies],
    detail.game.enemies,
  ];
  return (
    <Stack spacing={1}>
      {detail.game.splitSides && (
        <Alert severity="info">{t("detail.noMatchups")}</Alert>
      )}
      {camps.map((camp, index) => (
        <Stack key={index} direction="row" spacing={1} wrap>
          {camp.map((joueur) => (
            <ChampionSlot
              key={`${joueur.side}-${joueur.championId}`}
              championName={joueur.championName ?? String(joueur.championId)}
              championIcon={joueur.iconUrl}
              playerName={joueur.displayName}
              playerAvatar={joueur.memberId ? avatars[joueur.memberId] : null}
              caption={`${joueur.kills}/${joueur.deaths}/${joueur.assists}`}
              onClick={() => onPick(joueur)}
              ariaLabel={t("detail.openPlayer", {
                player: joueur.displayName ?? joueur.championName ?? "",
              })}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

function FaceAFace({ detail, avatars, onPick }: JoueursProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const rang = useRankLabel();
  const ecartDeRang = useRankGap();

  const minutes = detail.game.durationSeconds / 60;
  const signe = (valeur: number) =>
    `${valeur > 0 ? "+" : ""}${format.entier(valeur)}`;
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
          playerName={
            allie ? (joueur.displayName ?? t("games.outsider")) : null
          }
          playerAvatar={
            allie && joueur.memberId ? avatars[joueur.memberId] : null
          }
          size="small"
          onClick={() => onPick(joueur)}
          ariaLabel={t("detail.openPlayer", {
            player: joueur.displayName ?? joueur.championName ?? "",
          })}
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
      <Chip
        label={ecart.label}
        tone={ecart.tone}
        variant="outline"
        size="small"
      />
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
    const or = nous.gold - eux.gold;
    const cs = nous.cs - eux.cs;
    const verdict = or >= SEUIL_OR ? "won" : or <= -SEUIL_OR ? "lost" : "even";
    return (
      <Stack spacing={0.25}>
        <Stack direction="row" spacing={0.75} align="center" wrap>
          <Chip
            label={t(`detail.lane.${verdict}`)}
            tone={
              verdict === "won"
                ? "success"
                : verdict === "lost"
                  ? "error"
                  : "neutral"
            }
            variant="outline"
            size="small"
          />
          <Text variant="caption" mono>
            {`${t("detail.goldDiff")} ${signe(or)} · ${t("detail.csDiff")} ${signe(cs)}`}
          </Text>
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
    {
      key: "ally",
      header: t("detail.ally"),
      width: 290,
      render: (l) => cote(l.ally, true),
    },
    {
      key: "gap",
      header: t("detail.gap"),
      width: 130,
      align: "right",
      render: (l) => gap(l.rankGap),
    },
    {
      key: "enemy",
      header: t("detail.enemy"),
      width: 290,
      render: (l) => cote(l.enemy, false),
    },
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
