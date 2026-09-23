import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Chip,
  Divider,
  MeterBar,
  Stack,
  StatGrid,
  Text,
} from "../../../design-system";
import type { PlayerStatsDto } from "../../../types/stats";
import { ChampionChoice } from "./ChampionChoice";
import { championsAffiches } from "./champions";
import { ChampionStatCard } from "./ChampionStatCard";
import { useMetrics } from "./metrics";
import { VersusTeammates } from "./PlayerStatsView";
import { useStatsFormat } from "./statsFormat";

const CHAMPIONS_EN_COLONNE = 3;

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

export function Tableau({ player }: { player: PlayerStatsDto }) {
  const format = useStatsFormat();
  const { tuiles } = useMetrics();
  if (!player.overall) {
    return null;
  }
  return (
    <Stack spacing={1.5}>
      <VersusTeammates versus={player.versusTeammates} compact />
      <StatGrid
        items={tuiles(player.overall, { compact: true, versus: player.versusTeammates })}
        size="small"
        minWidth={92}
        divided
      />
      {format.assise(player.coverage) && (
        <Text variant="caption" tone="secondary">
          {format.assise(player.coverage)}
        </Text>
      )}
    </Stack>
  );
}

export function Champions({ player }: { player: PlayerStatsDto }) {
  const { t } = useTranslation("stats");
  const [choisis, setChoisis] = useState<string[]>([]);
  return (
    <Stack spacing={1}>
      <Divider />
      <Stack direction="row" spacing={1} align="center" justify="between">
        <Text variant="caption" tone="secondary">
          {t("section.champions")}
        </Text>
        <ChampionChoice
          champions={player.champions}
          selected={choisis}
          onChange={setChoisis}
          defaultCount={CHAMPIONS_EN_COLONNE}
        />
      </Stack>
      {player.champions.length === 0 ? (
        <Text variant="caption" tone="disabled">
          {t("section.noChampion")}
        </Text>
      ) : (
        championsAffiches(player.champions, choisis, CHAMPIONS_EN_COLONNE).map((line) => (
          <ChampionStatCard key={line.key} line={line} compact />
        ))
      )}
    </Stack>
  );
}

export function Files({ player }: { player: PlayerStatsDto }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  if (player.queues.length === 0) {
    return null;
  }
  return (
    <Stack spacing={0.5}>
      <Text variant="caption" tone="secondary">
        {t("section.queues")}
      </Text>
      {player.queues.map((queue) => (
        <MeterBar
          key={queue.key}
          label={format.file(queue.key)}
          value={queue.winRate}
          valueLabel={`${format.taux(queue.winRate)} · ${t("coverage.gamesShort", { count: queue.games })}`}
        />
      ))}
    </Stack>
  );
}
