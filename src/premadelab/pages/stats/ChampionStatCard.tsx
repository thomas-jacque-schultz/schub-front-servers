import { useTranslation } from "react-i18next";
import { Card, ChampionIcon, Stack, StatGrid, Text } from "../../../common";
import type { RadarReferencesDto, StatLineDto } from "../../types/stats";
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
  /** Toutes ses parties : la carte ne garde que les deux stats qui s'en écartent le plus (Schub#93). */
  overall?: StatLineDto | null;
}

// Écart relatif à sa moyenne, orienté « plus haut = mieux » ; une mesure neutre ne se distingue pas.
const ecartRelatif = (
  champion: StatLineDto,
  overall: StatLineDto,
  key: MetricKey,
  polarity: "higher" | "lower" | "neutral",
) => {
  const a = champion[key];
  const b = overall[key];
  if (
    typeof a !== "number" ||
    typeof b !== "number" ||
    b === 0 ||
    polarity === "neutral"
  ) {
    return 0;
  }
  const ecart = (a - b) / Math.abs(b);
  return polarity === "lower" ? -ecart : ecart;
};

// Les mêmes indicateurs, dans le même ordre, que la rangée de Mes stats : un champion se lit contre la moyenne du joueur.
export function ChampionStatCard({
  line,
  compact = false,
  references,
  overall,
}: ChampionStatCardProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { tuiles, definitions } = useMetrics();
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
              {ecart && !(overall && line.versusRest)
                ? `${t("coverage.gamesShort", { count: line.games })} · ${ecart}`
                : t("coverage.gamesShort", { count: line.games })}
            </Text>
          </Stack>
          <Text variant="subtitle" mono>
            {format.taux(line.winRate)}
          </Text>
        </Stack>
        {!compact && overall && line.versusRest && (
          <Text variant="caption">
            {t("champion.versusRest", {
              delta: ecart,
              count: line.versusRest.referenceGames,
            })}
          </Text>
        )}
        <StatGrid
          items={tuiles(line, {
            compact: true,
            keys: compact
              ? COMPACT
              : overall
                ? [...COMPLET]
                    .sort(
                      (a, b) =>
                        Math.abs(
                          ecartRelatif(
                            line,
                            overall,
                            b,
                            definitions[b].polarity,
                          ),
                        ) -
                        Math.abs(
                          ecartRelatif(
                            line,
                            overall,
                            a,
                            definitions[a].polarity,
                          ),
                        ),
                    )
                    .slice(0, 2)
                : COMPLET,
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
