import { type ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { StatGridItem } from "../../../design-system";
import type { StatLineDto, TeamComparisonDto } from "../../../types/stats";
import { useStatsFormat } from "./statsFormat";

/**
 * Le catalogue des indicateurs : un seul ordre, un seul libellé, une seule mise en forme pour
 * tous les écrans. Deux panneaux qui divergent ici ne se comparent plus.
 */
export type MetricKey =
  | "winRate"
  | "kda"
  | "csPerMinute"
  | "goldPerMinute"
  | "damagePerMinute"
  | "damageTakenPerMinute"
  | "visionPerMinute"
  | "killParticipation"
  | "deathShare"
  | MetriqueDePartie;

/** Les métriques de la projection v3 : libellées sous leur propre clé. */
type MetriqueDePartie =
  | "wardsKilledPerMinute"
  | "controlWardsPlaced"
  | "damageShare"
  | "deathsPer10"
  | "timeDeadShare"
  | "turretDamagePerMinute"
  | "turretTakedowns"
  | "epicMonsterDamagePerMinute"
  | "platesDiff"
  | "goldDiffAt15"
  | "csDiffAt15"
  | "xpDiffAt15"
  | "killsDiffAt15";

type Deltas = Pick<
  TeamComparisonDto,
  | "winRateDelta"
  | "kdaDelta"
  | "csPerMinuteDelta"
  | "goldPerMinuteDelta"
  | "damagePerMinuteDelta"
  | "damageTakenPerMinuteDelta"
  | "visionPerMinuteDelta"
>;

interface MetricDefinition {
  key: MetricKey;
  label: string;
  short: string;
  format: (value: number | null | undefined) => string;
  delta: (value: number | null | undefined) => string | null;
  deltaOf: (comparison: Deltas) => number | null;
  /** Les dégâts subis n'ont pas de bon sens : un tank en encaisse, c'est son rôle. */
  polarity: "higher" | "lower" | "neutral";
}

export const KPI_ORDER: MetricKey[] = [
  "winRate",
  "kda",
  "killParticipation",
  "deathShare",
  "csPerMinute",
  "goldPerMinute",
  "damagePerMinute",
  "damageTakenPerMinute",
  "visionPerMinute",
];

/** Les six familles de la fiche détaillée, dans l'ordre de lecture d'une partie. */
export const FAMILLES: { key: string; metrics: MetricKey[] }[] = [
  { key: "income", metrics: ["csPerMinute", "goldPerMinute"] },
  {
    key: "laning",
    metrics: [
      "goldDiffAt15",
      "csDiffAt15",
      "xpDiffAt15",
      "killsDiffAt15",
      "platesDiff",
    ],
  },
  {
    key: "fights",
    metrics: [
      "damagePerMinute",
      "damageShare",
      "killParticipation",
      "deathShare",
    ],
  },
  {
    key: "survival",
    metrics: ["kda", "deathsPer10", "timeDeadShare", "damageTakenPerMinute"],
  },
  {
    key: "vision",
    metrics: ["visionPerMinute", "wardsKilledPerMinute", "controlWardsPlaced"],
  },
  {
    key: "objectives",
    metrics: [
      "turretDamagePerMinute",
      "turretTakedowns",
      "epicMonsterDamagePerMinute",
    ],
  },
];

export const useMetrics = () => {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();

  return useMemo(() => {
    const ecartEntier = (value: number | null | undefined) =>
      value === null || value === undefined
        ? null
        : `${value > 0 ? "+" : ""}${format.entier(value)}`;

    // Sans écart aux coéquipiers : le cœur ne le calcule que pour les indicateurs historiques.
    const simple = (
      key: MetriqueDePartie,
      format: (value: number | null | undefined) => string,
      polarity: MetricDefinition["polarity"],
    ): MetricDefinition => ({
      key,
      label: t(`metric.${key}`),
      short: t(`metricShort.${key}`),
      format,
      delta: () => null,
      deltaOf: () => null,
      polarity,
    });
    const signe = (value: number | null | undefined) =>
      ecartEntier(value) ?? format.absent;
    const signeDecimal = (value: number | null | undefined) =>
      format.ecartRatio(value) ?? format.absent;

    const nouvelles = {
      wardsKilledPerMinute: simple(
        "wardsKilledPerMinute",
        format.ratio,
        "higher",
      ),
      controlWardsPlaced: simple("controlWardsPlaced", format.ratio, "higher"),
      damageShare: simple("damageShare", format.taux, "higher"),
      deathsPer10: simple("deathsPer10", format.ratio, "lower"),
      timeDeadShare: simple("timeDeadShare", format.taux, "lower"),
      turretDamagePerMinute: simple(
        "turretDamagePerMinute",
        format.entier,
        "higher",
      ),
      turretTakedowns: simple("turretTakedowns", format.ratio, "higher"),
      epicMonsterDamagePerMinute: simple(
        "epicMonsterDamagePerMinute",
        format.entier,
        "higher",
      ),
      platesDiff: simple("platesDiff", signeDecimal, "higher"),
      goldDiffAt15: simple("goldDiffAt15", signe, "higher"),
      csDiffAt15: simple("csDiffAt15", signeDecimal, "higher"),
      xpDiffAt15: simple("xpDiffAt15", signe, "higher"),
      killsDiffAt15: simple("killsDiffAt15", signeDecimal, "higher"),
    };

    const definitions: Record<MetricKey, MetricDefinition> = {
      winRate: {
        key: "winRate",
        label: t("metric.winRate"),
        short: t("metricShort.winRate"),
        format: format.taux,
        delta: format.ecartEnPoints,
        deltaOf: (c) => c.winRateDelta,
        polarity: "higher",
      },
      kda: {
        key: "kda",
        label: t("metric.kda"),
        short: t("metricShort.kda"),
        format: format.ratio,
        delta: format.ecartRatio,
        deltaOf: (c) => c.kdaDelta,
        polarity: "higher",
      },
      csPerMinute: {
        key: "csPerMinute",
        label: t("metric.cs"),
        short: t("metricShort.cs"),
        format: format.ratio,
        delta: format.ecartRatio,
        deltaOf: (c) => c.csPerMinuteDelta,
        polarity: "higher",
      },
      goldPerMinute: {
        key: "goldPerMinute",
        label: t("metric.gold"),
        short: t("metricShort.gold"),
        format: format.entier,
        delta: ecartEntier,
        deltaOf: (c) => c.goldPerMinuteDelta,
        polarity: "higher",
      },
      damagePerMinute: {
        key: "damagePerMinute",
        label: t("metric.dpm"),
        short: t("metricShort.dpm"),
        format: format.entier,
        delta: ecartEntier,
        deltaOf: (c) => c.damagePerMinuteDelta,
        polarity: "higher",
      },
      damageTakenPerMinute: {
        key: "damageTakenPerMinute",
        label: t("metric.damageTaken"),
        short: t("metricShort.damageTaken"),
        format: format.entier,
        delta: ecartEntier,
        deltaOf: (c) => c.damageTakenPerMinuteDelta,
        polarity: "neutral",
      },
      visionPerMinute: {
        key: "visionPerMinute",
        label: t("metric.vision"),
        short: t("metricShort.vision"),
        format: format.ratio,
        delta: format.ecartRatio,
        deltaOf: (c) => c.visionPerMinuteDelta,
        polarity: "higher",
      },
      killParticipation: {
        key: "killParticipation",
        label: t("metric.kp"),
        short: t("metricShort.kp"),
        format: format.taux,
        delta: format.ecartEnPoints,
        deltaOf: () => null,
        polarity: "higher",
      },
      deathShare: {
        key: "deathShare",
        label: t("metric.dp"),
        short: t("metricShort.dp"),
        format: format.taux,
        delta: format.ecartEnPoints,
        deltaOf: () => null,
        polarity: "lower",
      },
      ...nouvelles,
    };

    /** Une rangée de tuiles dans l'ordre du catalogue, avec l'écart aux coéquipiers s'il existe. */
    const tuiles = (
      line: StatLineDto,
      options: {
        compact?: boolean;
        versus?: TeamComparisonDto | null;
        keys?: MetricKey[];
        adornment?: (key: MetricKey) => ReactNode | undefined;
      } = {},
    ): StatGridItem[] =>
      (options.keys ?? KPI_ORDER).map((key) => {
        const metric = definitions[key];
        const ecart = options.versus ? metric.deltaOf(options.versus) : null;
        return {
          key,
          label: options.compact ? metric.short : metric.label,
          value: metric.format(line[key]),
          hint:
            key === "kda" && !options.compact
              ? t("metric.kdaDetail", {
                  kills: format.ratio(line.killsPerGame),
                  deaths: format.ratio(line.deathsPerGame),
                  assists: format.ratio(line.assistsPerGame),
                })
              : undefined,
          adornment: options.adornment?.(key),
          delta: metric.delta(ecart) ?? undefined,
          deltaTone:
            metric.polarity === "neutral"
              ? "neutral"
              : format.tonDeLEcart(
                  metric.polarity === "lower" && ecart !== null
                    ? -ecart
                    : ecart,
                ),
        };
      });

    return { definitions, tuiles };
  }, [format, t]);
};
