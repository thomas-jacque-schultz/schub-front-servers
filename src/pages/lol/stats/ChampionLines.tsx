import { useTranslation } from "react-i18next";
import { Avatar, MeterBar, Stack, Text } from "../../../design-system";
import type { StatLineDto } from "../../../types/stats";
import { useStatsFormat } from "./statsFormat";

export interface ChampionLinesProps {
  lines: StatLineDto[];
}

export function ChampionLines({ lines }: ChampionLinesProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();

  if (lines.length === 0) {
    return (
      <Text variant="caption" tone="secondary">
        {t("section.noChampion")}
      </Text>
    );
  }

  return (
    <Stack spacing={0.75}>
      <Text variant="caption" tone="secondary">
        {t("section.champions")}
      </Text>
      {lines.map((line) => {
        const ecart = format.ecartEnPoints(line.versusRest?.winRateDelta);
        return (
          <Stack key={line.key} direction="row" spacing={1} align="center">
            <Avatar
              src={line.iconUrl}
              name={line.label ?? line.key}
              size="small"
            />
            <Stack spacing={0} fullWidth>
              <MeterBar
                label={line.label ?? line.key}
                value={line.winRate}
                valueLabel={`${format.taux(line.winRate)} · ${t(
                  "coverage.gamesShort",
                  {
                    count: line.games,
                  },
                )}`}
                hint={
                  ecart && line.versusRest
                    ? t("delta.versusRest", {
                        delta: ecart,
                        count: line.versusRest.referenceGames,
                      })
                    : undefined
                }
              />
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
