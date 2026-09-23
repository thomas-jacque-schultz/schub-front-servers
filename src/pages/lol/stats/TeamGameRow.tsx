import { useTranslation } from "react-i18next";
import {
  ChampionSlot,
  Chip,
  Stack,
  Text,
  Tooltip,
} from "../../../design-system";
import { useLocaleFormat } from "../../../i18n/format";
import type {
  AverageRankDto,
  SideRanksDto,
  TeamGameDto,
  TeamGamePlayerDto,
} from "../../../types/stats";
import { useAverageRankLabel } from "./rank";
import { useStatsFormat } from "./statsFormat";

const ORDRE_POSTES = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];

const parPoste = (joueurs: TeamGamePlayerDto[]) =>
  [...joueurs].sort(
    (a, b) => rangDuPoste(a.position) - rangDuPoste(b.position),
  );

const rangDuPoste = (position: string | null) => {
  const index = ORDRE_POSTES.indexOf(position ?? "");
  return index < 0 ? ORDRE_POSTES.length : index;
};

export interface TeamGameRowProps {
  game: TeamGameDto;
  avatars: Record<string, string | null>;
  /** Le nombre de membres présents n'a de sens que pour une partie d'équipe. */
  showPresence?: boolean;
}

/**
 * Une partie sur trois étages : ce qu'elle était, nos champions encadrés avec leur joueur, les
 * adversaires dessous. À droite, les rangs moyens des deux camps. C'est la ligne cliquable de l'historique :
 * elle ne contient aucun autre élément cliquable.
 */
export function TeamGameRow({
  game,
  avatars,
  showPresence = true,
}: TeamGameRowProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { formatDate } = useLocaleFormat();

  const nous = parPoste([...game.players, ...game.allies]);
  const eux = parPoste(game.enemies);
  const kda = (joueur: TeamGamePlayerDto) =>
    `${joueur.kills}/${joueur.deaths}/${joueur.assists}`;

  return (
    <Stack direction="responsive" spacing={2} justify="between" fullWidth>
      <Stack spacing={1.25} fullWidth>
        <Stack direction="row" spacing={1} align="center" wrap>
          {game.win === null ? (
            <Chip label={t("games.split")} variant="outline" size="small" />
          ) : (
            <Chip
              label={game.win ? t("games.win") : t("games.loss")}
              tone={game.win ? "success" : "neutral"}
              size="small"
            />
          )}
          <Text variant="caption" mono>
            {game.startedAt
              ? formatDate(new Date(game.startedAt))
              : format.absent}
          </Text>
          <Text variant="caption" tone="secondary">
            {[
              format.file(game.queue),
              format.duree(game.durationSeconds),
              nous.length > 0 ? format.cote(nous[0].side) : null,
              game.patch,
              showPresence
                ? t("games.presentCount", { count: game.presentPlayers })
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </Stack>

        <Stack direction="row" spacing={1} wrap>
          {nous.map((joueur) => (
            <ChampionSlot
              key={`${game.matchId}-${joueur.championId}-${joueur.side}`}
              championName={joueur.championName ?? String(joueur.championId)}
              championIcon={joueur.iconUrl}
              playerName={joueur.displayName ?? t("games.outsider")}
              playerAvatar={joueur.memberId ? avatars[joueur.memberId] : null}
              caption={kda(joueur)}
            />
          ))}
        </Stack>

        {eux.length > 0 && (
          <Stack direction="row" spacing={1} align="center" wrap>
            <Text variant="caption" tone="secondary">
              {t("games.enemies")}
            </Text>
            {eux.map((joueur) => (
              <ChampionSlot
                key={`${game.matchId}-${joueur.championId}-${joueur.side}`}
                championName={joueur.championName ?? String(joueur.championId)}
                championIcon={joueur.iconUrl}
                caption={kda(joueur)}
                size="small"
                framed={false}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <RangsDesCamps
        nous={game.allyRanks}
        eux={game.enemyRanks}
        observe={game.ranksObservedAt}
      />
    </Stack>
  );
}

function RangsDesCamps({
  nous,
  eux,
  observe,
}: {
  nous: SideRanksDto | null;
  eux: SideRanksDto | null;
  observe: string | null;
}) {
  const { t } = useTranslation("stats");
  const { formatDate } = useLocaleFormat();

  if (!observe) {
    return (
      <Text variant="caption" tone="disabled">
        {t("games.ranksPending")}
      </Text>
    );
  }

  const ligne = (
    libelle: string,
    solo: AverageRankDto | null,
    flex: AverageRankDto | null,
  ) => (
    <Stack direction="row" spacing={1} align="center">
      <Text variant="caption" tone="secondary">
        {libelle}
      </Text>
      <RangMoyen rank={solo} />
      <RangMoyen rank={flex} />
    </Stack>
  );

  return (
    <Tooltip
      title={t("games.ranksObserved", { date: formatDate(new Date(observe)) })}
    >
      <Stack spacing={0.5} align="end">
        <Stack direction="row" spacing={1}>
          <Text variant="caption" tone="disabled">
            {t("games.solo")}
          </Text>
          <Text variant="caption" tone="disabled">
            {t("games.flex")}
          </Text>
        </Stack>
        {ligne(t("games.ours"), nous?.solo ?? null, nous?.flex ?? null)}
        {ligne(t("games.theirs"), eux?.solo ?? null, eux?.flex ?? null)}
      </Stack>
    </Tooltip>
  );
}

function RangMoyen({ rank }: { rank: AverageRankDto | null }) {
  const { t } = useTranslation("stats");
  const libelle = useAverageRankLabel();
  return (
    <Tooltip title={rank ? t("games.rankHint", { count: rank.counted }) : ""}>
      <Chip label={libelle(rank)} variant="outline" size="small" />
    </Tooltip>
  );
}
