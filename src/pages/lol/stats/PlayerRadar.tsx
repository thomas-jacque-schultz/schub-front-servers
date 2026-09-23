import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RadarChart, SegmentedControl, Stack, type RadarSeries } from "../../../design-system";
import type { MetricBoundDto, RadarReferencesDto, StatLineDto } from "../../../types/stats";
import { type MetricKey, useMetrics } from "./metrics";
import { type RadarReference, referenceParDefaut } from "./radar";
import { useStatsFormat } from "./statsFormat";

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
  overall: StatLineDto | null;
  positions: StatLineDto[];
  references: RadarReferencesDto | null;
  /** Les lignes des joueurs de l'équipe, lui compris : sans elles, pas de référentiel d'équipe. */
  teamLines?: StatLineDto[];
  /** Imposé : plusieurs radars côte à côte partagent le référentiel choisi au-dessus d'eux. */
  reference?: RadarReference;
  label?: string;
}

export function PlayerRadar({
  overall,
  positions,
  references,
  teamLines,
  reference,
  label,
}: PlayerRadarProps) {
  const { t } = useTranslation("stats");
  const { definitions } = useMetrics();
  const format = useStatsFormat();
  const [locale, setLocale] = useState<RadarReference>(referenceParDefaut(teamLines));
  const choisie = reference ?? locale;
  const equipePossible = Boolean(teamLines && teamLines.length >= 2);

  const auPoste = references ? positions.find((line) => line.key === references.position) ?? null : null;
  const poste = references ? format.poste(references.position) : format.absent;

  const vue = ((): { line: StatLineDto | null; bornes: Partial<Record<string, MetricBoundDto>>; note?: string; vide: string } => {
    if (choisie === "team") {
      const bornes: Partial<Record<string, MetricBoundDto>> = {};
      AXES.forEach((axe) => {
        const valeurs = (teamLines ?? [])
          .map((line) => line[axe])
          .filter((v): v is number => v !== null && v !== undefined);
        if (valeurs.length >= 2) {
          bornes[axe] = { low: Math.min(...valeurs), high: Math.max(...valeurs) };
        }
      });
      return {
        line: overall,
        bornes,
        note: t("radar.note.team"),
        vide: equipePossible ? t("radar.empty.noGames") : t("radar.empty.team"),
      };
    }
    if (!references) {
      return { line: null, bornes: {}, vide: t("radar.empty.noGames") };
    }
    const ref = choisie === "met" ? references.met : references.league;
    const vide =
      choisie === "met"
        ? t("radar.empty.met", { position: poste })
        : references.tier
          ? t("radar.empty.leagueThin", { tier: t(`tier.${references.tier}`, { defaultValue: references.tier }), position: poste })
          : t("radar.empty.unranked");
    if (!ref) {
      return { line: null, bornes: {}, vide };
    }
    return {
      line: auPoste,
      bornes: ref.bounds,
      note: t(choisie === "met" ? "radar.note.met" : "radar.note.league", {
        position: poste,
        games: auPoste?.games ?? 0,
        count: ref.population,
        min: ref.minimumGames,
        tier: ref.tier ? t(`tier.${ref.tier}`, { defaultValue: ref.tier }) : "",
      }),
      vide,
    };
  })();

  const normalise = (key: MetricKey, value: number | null | undefined) => {
    const borne = vue.bornes[key];
    if (value === null || value === undefined || !borne) {
      return null;
    }
    const position = borne.high > borne.low ? (value - borne.low) / (borne.high - borne.low) : 0.5;
    return definitions[key].polarity === "lower" ? 1 - position : position;
  };

  const series: RadarSeries[] = vue.line
    ? [
        {
          key: choisie,
          label: choisie === "team" ? t("radar.series.period") : t("radar.series.position", { position: poste }),
          emphasis: "primary",
          values: AXES.map((axe) => normalise(axe, vue.line?.[axe])),
          display: AXES.map((axe) => definitions[axe].format(vue.line?.[axe])),
        },
      ]
    : [];

  return (
    <Stack spacing={1}>
      {!reference && (
        <RadarReferenceSelector
          value={choisie}
          onChange={(valeur) => setLocale(valeur as RadarReference)}
          teamAvailable={equipePossible}
        />
      )}
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

export function RadarReferenceSelector({
  value,
  onChange,
  teamAvailable,
}: {
  value: RadarReference;
  onChange: (value: string) => void;
  teamAvailable: boolean;
}) {
  const { t } = useTranslation("stats");
  return (
    <SegmentedControl
      label={t("radar.reference.label")}
      value={value}
      onChange={onChange}
      options={[
        ...(teamAvailable ? [{ value: "team", label: t("radar.reference.team") }] : []),
        { value: "met", label: t("radar.reference.met") },
        { value: "league", label: t("radar.reference.league") },
      ]}
    />
  );
}
