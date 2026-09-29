import { useTranslation } from "react-i18next";
import {
  Columns,
  QuadStatTile,
  RadarChart,
  Stack,
  Text,
  type RadarSeries,
} from "../../../common";
import type { PlayerStatsDto, StatLineDto } from "../../types/stats";
import { KPI_ORDER, type MetricKey, useMetrics } from "./metrics";
import { bornesPremade, premadeFigure } from "./premade";
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

interface PremadeProps {
  player: PlayerStatsDto;
  /** Les lignes premade de tous les membres, lui compris. */
  lines: { memberId: string; line: StatLineDto }[];
}

export function PremadeTiles({ player, lines }: PremadeProps) {
  const { t } = useTranslation("stats");
  const { definitions } = useMetrics();
  const format = useStatsFormat();
  const parties = player.premade?.games ?? 0;
  const ton = (ecart: number | null, key: MetricKey) => {
    const polarity = definitions[key].polarity;
    if (polarity === "neutral" || ecart === null) {
      return "neutral" as const;
    }
    return format.tonDeLEcart(polarity === "lower" ? -ecart : ecart);
  };

  return (
    <Stack spacing={1}>
      <Text variant="caption" tone="secondary">
        {parties > 0
          ? t("premade.games", { count: parties })
          : t("premade.none")}
      </Text>
      {parties > 0 && (
        <Columns minWidth={104} spacing={0.75}>
          {KPI_ORDER.map((key) => {
            const metric = definitions[key];
            const chiffre = premadeFigure(player, lines, key, metric.polarity);
            return (
              <QuadStatTile
                key={key}
                label={metric.short}
                main={{
                  value: metric.format(chiffre.value),
                  hint: t("premade.hint.main", { count: parties }),
                }}
                topRight={{
                  value: metric.delta(chiffre.versusSelf) ?? format.absent,
                  tone: ton(chiffre.versusSelf, key),
                  hint: t("premade.hint.self"),
                }}
                bottomLeft={{
                  value: metric.delta(chiffre.versusTeammates) ?? format.absent,
                  tone: ton(chiffre.versusTeammates, key),
                  hint: t("premade.hint.teammates"),
                }}
                bottomRight={{
                  value:
                    chiffre.rank === null
                      ? format.absent
                      : t("premade.rank", {
                          count: chiffre.rank,
                          ordinal: true,
                        }),
                  hint: t("premade.hint.rank", { count: lines.length }),
                }}
              />
            );
          })}
        </Columns>
      )}
    </Stack>
  );
}

export function PremadeRadar({ player, lines }: PremadeProps) {
  const { t } = useTranslation("stats");
  const { definitions } = useMetrics();
  const bornes = bornesPremade(
    lines.map((entry) => entry.line),
    AXES,
  );
  const normalise = (key: MetricKey, value: number | null | undefined) => {
    const borne = bornes[key];
    if (value === null || value === undefined || !borne) {
      return null;
    }
    const position =
      borne.high > borne.low
        ? (value - borne.low) / (borne.high - borne.low)
        : 0.5;
    return definitions[key].polarity === "lower" ? 1 - position : position;
  };
  const line =
    player.premade && player.premade.games > 0 ? player.premade : null;

  const series: RadarSeries[] = line
    ? [
        {
          key: "premade",
          label: t("premade.radar.player"),
          emphasis: "primary",
          values: AXES.map((axe) => normalise(axe, line[axe])),
          display: AXES.map((axe) => definitions[axe].format(line[axe])),
        },
        {
          key: "mean",
          label: t("premade.radar.mean"),
          emphasis: "muted",
          values: AXES.map((axe) => normalise(axe, bornes[axe]?.mean)),
          display: AXES.map((axe) =>
            definitions[axe].format(bornes[axe]?.mean),
          ),
        },
      ]
    : [];

  return (
    <RadarChart
      label={t("radar.title")}
      axes={AXES.map((axe) => ({ key: axe, label: definitions[axe].short }))}
      series={series}
      emptyLabel={
        lines.length < 2 ? t("premade.radar.fewMembers") : t("premade.none")
      }
      scaleNote={series.length > 0 ? t("premade.radar.note") : undefined}
    />
  );
}
