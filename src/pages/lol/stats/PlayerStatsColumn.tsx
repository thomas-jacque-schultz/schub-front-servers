import { useTranslation } from "react-i18next";
import {
  Avatar,
  Card,
  Chip,
  Divider,
  MeterBar,
  Stack,
  StatGrid,
  StatTile,
  Text,
} from "../../../design-system";
import type { MetricScaleDto, PlayerStatsDto } from "../../../types/stats";
import { ChampionStatCard } from "./ChampionStatCard";
import { useMetrics } from "./metrics";
import { PlayerRadar } from "./PlayerRadar";
import { rangDeReference } from "./rank";
import { RankedStandings } from "./RankedStandings";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";

const CHAMPIONS_PAR_COLONNE = 3;

export interface PlayerStatsColumnProps {
  player: PlayerStatsDto;
  isViewer: boolean;
  scale: MetricScaleDto | null;
  /** Le radar ne se lit pas dans une colonne étroite : le panneau décide s'il a la place. */
  showRadar: boolean;
}

export function PlayerStatsColumn({ player, isViewer, scale, showRadar }: PlayerStatsColumnProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { tuiles } = useMetrics();
  const overall = player.overall;

  return (
    <Card>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} align="center">
          <Avatar src={player.avatarUrl} name={player.displayName ?? "?"} />
          <Stack spacing={0}>
            <Text variant="subtitle">{player.displayName ?? t("player.unnamed")}</Text>
            <Text variant="caption" tone="secondary">
              {player.roles.length > 0
                ? player.roles.map((role) => t(`roles.${role}`, { ns: "teams" })).join(" · ")
                : t("player.noRole")}
            </Text>
          </Stack>
          {isViewer && <Chip label={t("player.you")} tone="primary" size="small" />}
        </Stack>

        <RankedStandings standings={player.rankings} />

        {player.state !== "STATISTIQUES_CONNUES" || !overall ? (
          <StatsStateNote state={player.state} />
        ) : (
          <>
            <MeterBar
              label={t("metric.winRate")}
              value={overall.winRate}
              valueLabel={format.taux(overall.winRate)}
              hint={format.assise(player.coverage) ?? undefined}
            />
            {player.versusTeammates && (
              <StatTile
                size="small"
                label={t("delta.winRateVersusTeammates")}
                value={format.ecartEnPoints(player.versusTeammates.winRateDelta) ?? format.absent}
                hint={t("delta.versusTeammates", { count: player.versusTeammates.comparedWith })}
              />
            )}

            <StatGrid
              items={tuiles(overall, { compact: true, versus: player.versusTeammates })}
              size="small"
              minWidth={92}
              divided
            />

            {showRadar && (
              <PlayerRadar
                radar={player.radar}
                scale={scale}
                rank={rangDeReference(player.rankings)}
              />
            )}

            <Divider />

            <Text variant="caption" tone="secondary">
              {t("section.champions")}
            </Text>
            {player.champions.length === 0 ? (
              <Text variant="caption" tone="disabled">
                {t("section.noChampion")}
              </Text>
            ) : (
              <Stack spacing={1}>
                {player.champions.slice(0, CHAMPIONS_PAR_COLONNE).map((line) => (
                  <ChampionStatCard key={line.key} line={line} compact />
                ))}
              </Stack>
            )}

            {player.queues.length > 0 && (
              <Stack spacing={0.5}>
                <Text variant="caption" tone="secondary">
                  {t("section.queues")}
                </Text>
                {player.queues.map((queue) => (
                  <MeterBar
                    key={queue.key}
                    label={format.file(queue.key)}
                    value={queue.winRate}
                    valueLabel={`${format.taux(queue.winRate)} · ${t("coverage.gamesShort", {
                      count: queue.games,
                    })}`}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}
