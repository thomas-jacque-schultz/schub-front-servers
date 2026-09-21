import { useTranslation } from "react-i18next";
import {
  Avatar,
  Card,
  Chip,
  Divider,
  MeterBar,
  Stack,
  StatTile,
  Text,
} from "../../../design-system";
import type { PlayerStatsDto } from "../../../types/stats";
import { ChampionLines } from "./ChampionLines";
import { RankedStandings } from "./RankedStandings";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";

export interface PlayerStatsColumnProps {
  player: PlayerStatsDto;
  /** Le lecteur, pour qu'il se reconnaisse. Un fait sur lui, pas une comparaison d'identifiants. */
  isViewer: boolean;
}

/** Une colonne du panneau « joueurs ». */
export function PlayerStatsColumn({
  player,
  isViewer,
}: PlayerStatsColumnProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const overall = player.overall;

  return (
    <Card>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} align="center">
          <Avatar src={player.avatarUrl} name={player.displayName ?? "?"} />
          <Stack spacing={0}>
            <Text variant="subtitle">
              {player.displayName ?? t("player.unnamed")}
            </Text>
            <Text variant="caption" tone="secondary">
              {player.roles.length > 0
                ? player.roles.map((role) => t(`roles.${role}`, { ns: "teams" })).join(" · ")
                : t("player.noRole")}
            </Text>
          </Stack>
        </Stack>

        {isViewer && (
          <Stack direction="row" spacing={0.5} wrap>
            <Chip label={t("player.you")} tone="primary" size="small" />
          </Stack>
        )}

        {/* Tous les rangs, pas le premier : un joueur classé en solo et en flex en a deux. */}
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

            <Stack direction="row" spacing={2} wrap>
              <StatTile
                label={t("metric.kda")}
                value={format.ratio(overall.kda)}
                hint={t("metric.kdaDetail", {
                  kills: format.ratio(overall.killsPerGame),
                  deaths: format.ratio(overall.deathsPerGame),
                  assists: format.ratio(overall.assistsPerGame),
                })}
                delta={
                  player.versusTeammates
                    ? (format.ecartRatio(player.versusTeammates.kdaDelta) ??
                      undefined)
                    : undefined
                }
                deltaTone={format.tonDeLEcart(player.versusTeammates?.kdaDelta)}
                deltaHint={
                  player.versusTeammates
                    ? t("delta.versusTeammates", {
                        count: player.versusTeammates.comparedWith,
                      })
                    : undefined
                }
              />
              <StatTile
                label={t("metric.cs")}
                value={format.ratio(overall.csPerMinute)}
              />
              <StatTile
                label={t("metric.gold")}
                value={format.entier(overall.goldPerMinute)}
                delta={
                  player.versusTeammates
                    ? (format.ecartRatio(
                        player.versusTeammates.goldPerMinuteDelta,
                      ) ?? undefined)
                    : undefined
                }
                deltaTone={format.tonDeLEcart(
                  player.versusTeammates?.goldPerMinuteDelta,
                )}
              />
              <StatTile
                label={t("metric.vision")}
                value={format.ratio(overall.visionPerMinute)}
                delta={
                  player.versusTeammates
                    ? (format.ecartRatio(
                        player.versusTeammates.visionPerMinuteDelta,
                      ) ?? undefined)
                    : undefined
                }
                deltaTone={format.tonDeLEcart(
                  player.versusTeammates?.visionPerMinuteDelta,
                )}
              />
            </Stack>

            {player.versusTeammates && (
              <StatTile
                label={t("delta.winRateVersusTeammates")}
                value={
                  format.ecartEnPoints(player.versusTeammates.winRateDelta) ??
                  format.absent
                }
                hint={t("delta.versusTeammates", {
                  count: player.versusTeammates.comparedWith,
                })}
              />
            )}

            <Divider />

            <ChampionLines lines={player.champions} />

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
                    valueLabel={`${format.taux(queue.winRate)} · ${t(
                      "coverage.gamesShort",
                      {
                        count: queue.games,
                      },
                    )}`}
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
