import { useTranslation } from "react-i18next";
import { Avatar, Chip, Divider, Stack, Text } from "../../../common";
import type { PlayerStatsDto } from "../../types/stats";
import { ChampionChoice } from "./ChampionChoice";
import { CHAMPIONS_EN_COLONNE } from "./champions";
import { QueuePie } from "./QueuePie";

export function PlayerHeader({
  player,
  isViewer,
}: {
  player: PlayerStatsDto;
  isViewer: boolean;
}) {
  const { t } = useTranslation("stats");
  return (
    <Stack direction="row" spacing={1} align="center">
      <Avatar src={player.avatarUrl} name={player.displayName ?? "?"} />
      <Stack spacing={0}>
        <Text variant="subtitle">
          {player.displayName ?? t("player.unnamed")}
        </Text>
        <Text variant="caption" tone="secondary">
          {player.roles.length > 0
            ? player.roles
                .map((role) => t(`roles.${role}`, { ns: "teams" }))
                .join(" · ")
            : t("player.noRole")}
        </Text>
      </Stack>
      {isViewer && <Chip label={t("player.you")} tone="primary" size="small" />}
    </Stack>
  );
}

export function ChampionsHeader({
  player,
  selected,
  onChange,
}: {
  player: PlayerStatsDto;
  selected: string[];
  onChange: (keys: string[]) => void;
}) {
  const { t } = useTranslation("stats");
  return (
    <Stack spacing={1}>
      <Divider />
      <Stack direction="row" spacing={1} align="center" justify="between">
        <Text variant="caption" tone="secondary">
          {t("section.champions")}
        </Text>
        <ChampionChoice
          champions={player.champions}
          selected={selected}
          onChange={onChange}
          defaultCount={CHAMPIONS_EN_COLONNE}
        />
      </Stack>
      {player.champions.length === 0 && (
        <Text variant="caption" tone="disabled">
          {t("section.noChampion")}
        </Text>
      )}
    </Stack>
  );
}

export function Files({ player }: { player: PlayerStatsDto }) {
  const { t } = useTranslation("stats");
  if (player.queues.length === 0) {
    return null;
  }
  return <QueuePie queues={player.queues} label={t("section.queues")} />;
}
