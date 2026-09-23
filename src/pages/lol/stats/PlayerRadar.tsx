import { useTranslation } from "react-i18next";
import { RadarChart, type RadarSeries } from "../../../design-system";
import type {
  MetricScaleDto,
  RadarDto,
  RankedStandingDto,
  StatLineDto,
} from "../../../types/stats";
import { type MetricKey, useMetrics } from "./metrics";
import { RANG_MAX, rangNumerique, useRankLabel } from "./rank";

const AXES: MetricKey[] = [
  "damagePerMinute",
  "goldPerMinute",
  "damageTakenPerMinute",
  "kda",
  "killParticipation",
  "deathShare",
  "visionPerMinute",
  "winRate",
];

export interface PlayerRadarProps {
  radar: RadarDto | null;
  scale: MetricScaleDto | null;
  /** Le classement courant : Riot n'en garde pas d'historique, il vaut pour les deux séries. */
  rank: RankedStandingDto | null;
  label?: string;
}

export function PlayerRadar({ radar, scale, rank, label }: PlayerRadarProps) {
  const { t } = useTranslation("stats");
  const { definitions } = useMetrics();
  const rangLibelle = useRankLabel();

  const normalise = (key: MetricKey, value: number | null | undefined) => {
    const borne = scale?.bounds[key];
    if (value === null || value === undefined || !borne || borne.high <= borne.low) {
      return null;
    }
    const position = (value - borne.low) / (borne.high - borne.low);
    // Le bord du radar reste le bon côté : moins de morts de l'équipe, c'est mieux.
    return definitions[key].polarity === "lower" ? 1 - position : position;
  };

  const rang = rangNumerique(rank);
  const serie = (
    key: string,
    line: StatLineDto | null,
    patches: string[],
    emphasis: RadarSeries["emphasis"],
  ): RadarSeries | null =>
    line && patches.length > 0
      ? {
          key,
          label: t("radar.series", { patches: patches.join(" – ") }),
          emphasis,
          values: [...AXES.map((axe) => normalise(axe, line[axe])), rang === null ? null : rang / RANG_MAX],
          display: [...AXES.map((axe) => definitions[axe].format(line[axe])), rangLibelle(rank)],
        }
      : null;

  const series = radar
    ? [
        serie("recent", radar.recent, radar.recentPatches, "primary"),
        serie("previous", radar.previous, radar.previousPatches, "secondary"),
      ].filter((s): s is RadarSeries => s !== null)
    : [];

  return (
    <RadarChart
      label={label ?? t("radar.title")}
      axes={[
        ...AXES.map((axe) => ({ key: axe, label: definitions[axe].short })),
        { key: "rank", label: t("metricShort.rank") },
      ]}
      series={scale ? series : []}
      emptyLabel={scale ? t("radar.empty") : t("radar.noScale")}
      scaleNote={
        scale ? t("radar.scaleNote", { count: scale.population, min: scale.minimumGames }) : undefined
      }
    />
  );
}
