import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RadarChart,
  SegmentedControl,
  Stack,
  type RadarSeries,
} from "../../../common";
import type {
  MetricBoundDto,
  RadarReferencesDto,
  StatLineDto,
} from "../../types/stats";
import { type MetricKey, useMetrics } from "./metrics";
import { useStatsFormat } from "./statsFormat";
import { groupeDePalier, noter } from "./grading";
import { useReferenceGrid } from "./useReferenceGrid";

type RadarReference = "met" | "league";

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
  positions: StatLineDto[];
  references: RadarReferencesDto | null;
  label?: string;
}

export function PlayerRadar({
  positions,
  references,
  label,
}: PlayerRadarProps) {
  const { t } = useTranslation("stats");
  const { definitions } = useMetrics();
  const format = useStatsFormat();
  const [choisie, setChoisie] = useState<RadarReference>("met");
  const grille = useReferenceGrid(
    references?.position,
    "MEAN",
    references?.tier,
  );

  const auPoste = references
    ? (positions.find((line) => line.key === references.position) ?? null)
    : null;
  const poste = references ? format.poste(references.position) : format.absent;

  const vue = ((): {
    line: StatLineDto | null;
    bornes: Partial<Record<string, MetricBoundDto>>;
    note?: string;
    vide: string;
  } => {
    if (!references) {
      return { line: null, bornes: {}, vide: t("radar.empty.noGames") };
    }
    if (choisie === "league") {
      const groupe = groupeDePalier(references.tier);
      const population = groupe
        ? grille?.metrics.kda?.tiers[groupe]
        : undefined;
      const palier = references.tier
        ? t(`tier.${references.tier}`, { defaultValue: references.tier })
        : "";
      if (!references.tier) {
        return { line: null, bornes: {}, vide: t("radar.empty.unranked") };
      }
      if (!grille || !population) {
        return {
          line: null,
          bornes: {},
          vide: t("radar.empty.leagueThin", { tier: palier, position: poste }),
        };
      }
      return {
        line: auPoste,
        bornes: {},
        note: t("radar.note.league", {
          position: poste,
          games: auPoste?.games ?? 0,
          count: population.count,
          tier: palier,
          patches: grille.patches.join(", "),
        }),
        vide: t("radar.empty.leagueThin", { tier: palier, position: poste }),
      };
    }
    const ref = references.met;
    if (!ref) {
      return {
        line: null,
        bornes: {},
        vide: t("radar.empty.met", { position: poste }),
      };
    }
    return {
      line: auPoste,
      bornes: ref.bounds,
      note: t("radar.note.met", {
        position: poste,
        games: auPoste?.games ?? 0,
        count: ref.population,
        min: ref.minimumGames,
      }),
      vide: t("radar.empty.met", { position: poste }),
    };
  })();

  // Palier : le percentile dans sa grille. Adversaires : une règle entre leurs bornes.
  const normalise = (key: MetricKey, value: number | null | undefined) => {
    if (choisie === "league") {
      return grille && references
        ? (noter(value, grille.metrics[key], grille, references.tier)?.inTier ??
            null)
        : null;
    }
    const borne = vue.bornes[key];
    if (value === null || value === undefined || !borne) {
      return null;
    }
    const position =
      borne.high > borne.low
        ? (value - borne.low) / (borne.high - borne.low)
        : 0.5;
    return definitions[key].polarity === "lower" ? 1 - position : position;
  };

  const series: RadarSeries[] = vue.line
    ? [
        {
          key: choisie,
          label: t("radar.series.position", { position: poste }),
          emphasis: "primary",
          values: AXES.map((axe) => normalise(axe, vue.line?.[axe])),
          display: AXES.map((axe) => definitions[axe].format(vue.line?.[axe])),
        },
      ]
    : [];

  return (
    <Stack spacing={1}>
      <SegmentedControl
        label={t("radar.reference.label")}
        value={choisie}
        onChange={(valeur) => setChoisie(valeur as RadarReference)}
        options={[
          { value: "met", label: t("radar.reference.met") },
          { value: "league", label: t("radar.reference.league") },
        ]}
      />
      <RadarChart
        label={label ?? t("radar.title")}
        axes={AXES.map((axe) => ({ key: axe, label: definitions[axe].short }))}
        series={series}
        emptyLabel={vue.vide}
        scaleNote={series.length > 0 ? vue.note : undefined}
      />
    </Stack>
  );
}
