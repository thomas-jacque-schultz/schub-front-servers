import { useTranslation } from "react-i18next";
import { Chip, Stack, Text } from "../../../design-system";
import type { RankedStandingDto } from "../../../types/stats";
import { RankBadge } from "./RankBadge";
import { useStatsFormat } from "./statsFormat";

export interface RankedStandingsProps {
  standings: RankedStandingDto[];
}

export function RankedStandings({ standings }: RankedStandingsProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();

  const classees = standings.filter((standing) => standing.tier);

  if (classees.length === 0) {
    return (
      <Text variant="caption" tone="disabled">
        {t("ranked.none")}
      </Text>
    );
  }

  return (
    <Stack spacing={0.5}>
      {classees.map((standing) => (
        <Stack
          key={standing.riotQueueType ?? standing.queue ?? standing.tier}
          direction="row"
          spacing={0.5}
          align="center"
          wrap
        >
          <Text variant="caption" tone="secondary">
            {nomDeFile(standing, format.file)}
          </Text>
          <RankBadge standing={standing} />
          <Text variant="caption" tone="disabled">
            {t("ranked.record", { wins: standing.wins, losses: standing.losses })}
          </Text>
          {standing.hotStreak && (
            <Chip label={t("ranked.hotStreak")} tone="success" size="small" variant="outline" />
          )}
          {standing.inactive && (
            <Chip label={t("ranked.inactive")} tone="warning" size="small" variant="outline" />
          )}
        </Stack>
      ))}
    </Stack>
  );
}

const nomDeFile = (
  standing: RankedStandingDto,
  traduit: (mode: string | null | undefined) => string,
): string =>
  standing.queue && standing.queue !== "OTHER"
    ? traduit(standing.queue)
    : (standing.riotQueueType ?? traduit(standing.queue));
