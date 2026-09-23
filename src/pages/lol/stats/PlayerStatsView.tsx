import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Card,
  Columns,
  MeterBar,
  Stack,
  StatGrid,
  StatTile,
  Text,
  TrendChart,
} from "../../../design-system";
import { useLocaleFormat } from "../../../i18n/format";
import type {
  MyStatsDto,
  StatLineDto,
  TeamComparisonDto,
} from "../../../types/stats";
import { ChampionChoice } from "./ChampionChoice";
import { championsAffiches } from "./champions";
import { ChampionStatCard } from "./ChampionStatCard";
import { FAMILLES, useMetrics } from "./metrics";
import { PlayerRadar } from "./PlayerRadar";
import { RankedStandings } from "./RankedStandings";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";
import { useGradeAdornment } from "./useGrades";

const CHAMPIONS_PLEINE_LARGEUR = 6;

/** Ce que Mes stats et un joueur d'équipe ont en commun. */
export type PlayerStatsData = Pick<
  MyStatsDto,
  | "state"
  | "coverage"
  | "overall"
  | "champions"
  | "positions"
  | "queues"
  | "months"
  | "rankings"
  | "references"
>;

export interface PlayerStatsViewProps {
  data: PlayerStatsData;
  versusTeammates?: TeamComparisonDto | null;
  /** Les lignes des joueurs de l'équipe : ouvrent le référentiel d'équipe du radar. */
  teamLines?: StatLineDto[];
}

export function PlayerStatsView({
  data,
  versusTeammates,
  teamLines,
}: PlayerStatsViewProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { formatMonth } = useLocaleFormat();
  const { tuiles } = useMetrics();
  const [choisis, setChoisis] = useState<string[]>([]);
  const adornment = useGradeAdornment(data.references, data.positions);
  const overall = data.overall;

  if (data.state !== "STATISTIQUES_CONNUES" || !overall) {
    return <StatsStateNote state={data.state} variant="block" />;
  }

  return (
    <Stack spacing={3}>
      <Card>
        <Stack spacing={2}>
          <VersusTeammates versus={versusTeammates} />
          <StatGrid
            items={tuiles(overall, { versus: versusTeammates, adornment })}
            minWidth={130}
            divided
          />
          <Text variant="caption" tone="secondary">
            {[format.assise(data.coverage), t("scope.rift")]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </Stack>
      </Card>

      {data.coverage && !data.coverage.tracked && (
        <Alert severity="info">{t("coverage.untracked")}</Alert>
      )}

      <Card title={t("family.title")}>
        <Stack spacing={2.5}>
          {FAMILLES.map((famille) => (
            <Stack key={famille.key} spacing={1}>
              <Text variant="subtitle">
                {t(`family.${famille.key}`, { defaultValue: famille.key })}
              </Text>
              <StatGrid
                items={tuiles(overall, { keys: famille.metrics, adornment })}
                minWidth={150}
              />
              {famille.key === "laning" && (
                <Text variant="caption" tone="secondary">
                  {t("family.laningBasis", { count: overall.laningGames })}
                </Text>
              )}
            </Stack>
          ))}
        </Stack>
      </Card>

      <Columns minWidth={320}>
        <Card title={t("radar.title")} description={t("radar.helper")}>
          <PlayerRadar
            overall={overall}
            positions={data.positions}
            references={data.references}
            teamLines={teamLines}
          />
        </Card>
        <Stack spacing={2}>
          <Card title={t("section.rankings")}>
            <RankedStandings standings={data.rankings} />
          </Card>
          <Card title={t("section.positions")}>
            <Stack spacing={0.75}>
              {data.positions.map((position) => (
                <MeterBar
                  key={position.key}
                  label={format.poste(position.key)}
                  value={position.winRate}
                  valueLabel={detail(position, format)}
                  hint={
                    position.versusRest
                      ? (t("delta.versusRest", {
                          delta: format.ecartEnPoints(
                            position.versusRest.winRateDelta,
                          ),
                          count: position.versusRest.referenceGames,
                        }) ?? undefined)
                      : undefined
                  }
                />
              ))}
            </Stack>
          </Card>
        </Stack>
      </Columns>

      <Card
        title={t("section.champions")}
        actions={
          <ChampionChoice
            champions={data.champions}
            selected={choisis}
            onChange={setChoisis}
            defaultCount={CHAMPIONS_PLEINE_LARGEUR}
          />
        }
      >
        {data.champions.length === 0 ? (
          <Text variant="caption" tone="secondary">
            {t("section.noChampion")}
          </Text>
        ) : (
          <Columns minWidth={280}>
            {championsAffiches(
              data.champions,
              choisis,
              CHAMPIONS_PLEINE_LARGEUR,
            ).map((line) => (
              <ChampionStatCard key={line.key} line={line} />
            ))}
          </Columns>
        )}
      </Card>

      <Card title={t("section.trend")} description={t("section.trendHelper")}>
        <TrendChart
          label={t("metric.winRate")}
          valueHeader={t("metric.winRate")}
          emptyLabel={t("section.noMonth")}
          scaleMax={1}
          reference={overall.winRate}
          referenceLabel={t("section.trendReference", {
            value: format.taux(overall.winRate),
          })}
          points={data.months.map((month) => ({
            key: month.key,
            label: etiquetteDuMois(month.key, formatMonth),
            value: month.winRate,
            title: t("section.trendPoint", {
              month: month.key,
              rate: format.taux(month.winRate),
              count: month.games,
            }),
          }))}
        />
      </Card>

      <Card title={t("section.queues")} description={t("section.queuesHelper")}>
        <Stack spacing={0.75}>
          {data.queues.map((queue) => (
            <MeterBar
              key={queue.key}
              label={format.file(queue.key)}
              value={queue.winRate}
              valueLabel={detail(queue, format)}
            />
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}

export function VersusTeammates({
  versus,
  compact = false,
}: {
  versus?: TeamComparisonDto | null;
  compact?: boolean;
}) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  if (!versus) {
    return null;
  }
  return (
    <StatTile
      size={compact ? "small" : "medium"}
      label={t("delta.winRateVersusTeammates")}
      value={format.ecartEnPoints(versus.winRateDelta) ?? format.absent}
      hint={t("delta.versusTeammates", { count: versus.comparedWith })}
    />
  );
}

const detail = (line: StatLineDto, format: ReturnType<typeof useStatsFormat>) =>
  `${format.taux(line.winRate)} · ${line.games}`;

const etiquetteDuMois = (key: string, formatMonth: (value: Date) => string) => {
  const [annee, mois] = key.split("-").map(Number);
  if (!annee || !mois) {
    return key;
  }
  return formatMonth(new Date(Date.UTC(annee, mois - 1, 1)));
};
