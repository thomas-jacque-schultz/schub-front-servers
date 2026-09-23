import { useTranslation } from "react-i18next";
import { Card, ChampionIcon, Stack, StatGrid, Text } from "../../../design-system";
import type { StatLineDto } from "../../../types/stats";
import { type MetricKey, useMetrics } from "./metrics";
import { useStatsFormat } from "./statsFormat";

const COMPACT: MetricKey[] = ["kda", "goldPerMinute", "damagePerMinute", "damageTakenPerMinute", "visionPerMinute"];

export interface ChampionStatCardProps {
  line: StatLineDto;
  /** Colonne étroite du panneau joueurs : icône plus petite, libellés courts. */
  compact?: boolean;
}

// Les mêmes indicateurs, dans le même ordre, que la rangée de Mes stats : un champion se lit contre la moyenne du joueur.
export function ChampionStatCard({ line, compact = false }: ChampionStatCardProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { tuiles } = useMetrics();
  const nom = line.label ?? line.key;
  const ecart = format.ecartEnPoints(line.versusRest?.winRateDelta);

  return (
    <Card>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.25} align="center">
          <ChampionIcon src={line.iconUrl} name={nom} size={compact ? "small" : "medium"} />
          <Stack spacing={0} fullWidth>
            <Text variant="subtitle">{nom}</Text>
            <Text variant="caption" tone="secondary">
              {t("coverage.gamesShort", { count: line.games })}
            </Text>
          </Stack>
          <Stack spacing={0} align="end">
            <Text variant="subtitle" mono>
              {format.taux(line.winRate)}
            </Text>
            {ecart && (
              <Text variant="caption" tone="secondary" mono>
                {ecart}
              </Text>
            )}
          </Stack>
        </Stack>
        <StatGrid
          items={tuiles(line, { compact: true, keys: compact ? COMPACT : undefined })}
          size="small"
          minWidth={compact ? 64 : 78}
          divided
        />
      </Stack>
    </Card>
  );
}
