import { useTranslation } from "react-i18next";
import {
  Card,
  ChampionIcon,
  Stack,
  StatGrid,
  Text,
} from "../../../design-system";
import type { RadarReferencesDto, StatLineDto } from "../../../types/stats";
import { KPI_ORDER, type MetricKey, useMetrics } from "./metrics";
import { useStatsFormat } from "./statsFormat";
import { useChampionAdornment } from "./useChampionGrades";

const COMPACT: MetricKey[] = [
  "kda",
  "goldPerMinute",
  "damagePerMinute",
  "damageTakenPerMinute",
  "visionPerMinute",
];
const COMPLET = KPI_ORDER.filter((key) => key !== "winRate");

export interface ChampionStatCardProps {
  line: StatLineDto;
  /** Colonne étroite du panneau joueurs : icône plus petite, libellés courts. */
  compact?: boolean;
  /** Palier et poste du joueur : sans eux, pas de note. */
  references?: RadarReferencesDto | null;
}

// Les mêmes indicateurs, dans le même ordre, que la rangée de Mes stats : un champion se lit contre la moyenne du joueur.
export function ChampionStatCard({
  line,
  compact = false,
  references,
}: ChampionStatCardProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { tuiles } = useMetrics();
  const adornment = useChampionAdornment(line, references);
  const nom = line.label ?? line.key;
  const ecart = format.ecartEnPoints(line.versusRest?.winRateDelta);

  return (
    <Card>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.25} align="center">
          <ChampionIcon
            src={line.iconUrl}
            name={nom}
            size={compact ? "small" : "medium"}
          />
          <Stack spacing={0} fullWidth>
            <Text variant="subtitle">{nom}</Text>
            <Text variant="caption" tone="secondary">
              {ecart
                ? `${t("coverage.gamesShort", { count: line.games })} · ${ecart}`
                : t("coverage.gamesShort", { count: line.games })}
            </Text>
          </Stack>
          <Text variant="subtitle" mono>
            {format.taux(line.winRate)}
          </Text>
        </Stack>
        <StatGrid
          items={tuiles(line, {
            compact: true,
            keys: compact ? COMPACT : COMPLET,
            adornment,
          })}
          size="small"
          minWidth={compact ? 52 : 78}
          divided
        />
      </Stack>
    </Card>
  );
}
