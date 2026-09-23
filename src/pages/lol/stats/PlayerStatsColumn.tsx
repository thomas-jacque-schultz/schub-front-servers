import { useTranslation } from "react-i18next";
import { Avatar, Card, Chip, Stack, Text } from "../../../design-system";
import type { MetricScaleDto, PlayerStatsDto } from "../../../types/stats";
import { PlayerStatsView } from "./PlayerStatsView";

export function PlayerHeader({ player, isViewer }: { player: PlayerStatsDto; isViewer: boolean }) {
  const { t } = useTranslation("stats");
  return (
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
  );
}

export interface PlayerStatsColumnProps {
  player: PlayerStatsDto;
  isViewer: boolean;
  scale: MetricScaleDto | null;
  showRadar: boolean;
}

export function PlayerStatsColumn({ player, isViewer, scale, showRadar }: PlayerStatsColumnProps) {
  return (
    <Card>
      <Stack spacing={1.5}>
        <PlayerHeader player={player} isViewer={isViewer} />
        <PlayerStatsView
          data={player}
          scale={scale}
          layout="column"
          versusTeammates={player.versusTeammates}
          showRadar={showRadar}
        />
      </Stack>
    </Card>
  );
}
