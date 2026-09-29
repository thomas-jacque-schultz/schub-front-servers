import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Card,
  Columns,
  MeterBar,
  Stack,
  StatGrid,
  Text,
  TrendChart,
  useLocaleFormat,
} from "../../../common";
import type { MyStatsDto, StatLineDto } from "../../types/stats";
import { ChampionChoice } from "./ChampionChoice";
import { championsAffiches } from "./champions";
import { ChampionStatCard } from "./ChampionStatCard";
import { GameAnalysis } from "./GameAnalysis";
import { useMetrics } from "./metrics";
import { PlayerRadar } from "./PlayerRadar";
import { QueuePie } from "./QueuePie";
import { RankedStandings } from "./RankedStandings";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";
import { useKpiSentence } from "./kpiSentence";
import type { MetricKey } from "./metrics";
import { useGradeAdornment } from "./useGrades";

const CHAMPIONS_PLEINE_LARGEUR = 8;
// En deçà, un patch se lit comme du bruit, pas comme une tendance.
const PARTIES_PAR_PATCH = 3;

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
  | "patches"
  | "rankings"
  | "references"
>;

export interface PlayerStatsViewProps {
  data: PlayerStatsData;
}

export function PlayerStatsView({ data }: PlayerStatsViewProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { formatDate } = useLocaleFormat();
  const { tuiles } = useMetrics();
  const [choisis, setChoisis] = useState<string[]>([]);
  const adornment = useGradeAdornment(data.references, data.positions);
  const conclusion = useKpiSentence(
    data.references,
    data.positions,
    data.months,
  );
  const overall = data.overall;

  if (data.state !== "STATISTIQUES_CONNUES" || !overall) {
    return <StatsStateNote state={data.state} variant="block" />;
  }

  return (
    <Stack spacing={3}>
      <Card>
        <Stack spacing={2}>
          <StatGrid
            items={tuiles(overall, { adornment }).map((tuile) => ({
              ...tuile,
              hint: conclusion(tuile.key as MetricKey) ?? tuile.hint,
            }))}
            minWidth={130}
            divided
            align="center"
            labelLines={2}
          />
          <Text variant="caption" tone="secondary" align="center">
            {[format.assise(data.coverage), t("scope.rift")]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </Stack>
      </Card>

      {data.coverage && !data.coverage.tracked && (
        <Alert severity="info">{t("coverage.untracked")}</Alert>
      )}

      <GameAnalysis
        overall={overall}
        references={data.references}
        positions={data.positions}
        months={data.months}
      />

      <Columns minWidth={320}>
        <Card title={t("radar.title")} description={t("radar.helper")}>
          <PlayerRadar
            positions={data.positions}
            references={data.references}
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
          <Columns minWidth={240} count={4}>
            {championsAffiches(
              data.champions,
              choisis,
              CHAMPIONS_PLEINE_LARGEUR,
            ).map((line) => (
              <ChampionStatCard
                key={line.key}
                line={line}
                references={data.references}
              />
            ))}
          </Columns>
        )}
      </Card>

      <Columns minWidth={440} count={2}>
        <Card title={t("section.trend")} description={t("section.trendHelper")}>
          <TrendChart
            label={t("metric.winRate")}
            valueHeader={t("metric.winRate")}
            emptyLabel={t("section.noPatch")}
            scaleMax={1}
            reference={overall.winRate}
            referenceLabel={t("section.trendReference", {
              value: format.taux(overall.winRate),
            })}
            points={data.patches.map((patch) => ({
              key: patch.key,
              label: patch.key,
              value: patch.winRate,
              muted: patch.games < PARTIES_PAR_PATCH,
              title: t("section.trendPoint", {
                patch: patch.key,
                from: patch.firstPlayedAt
                  ? formatDate(new Date(patch.firstPlayedAt))
                  : format.absent,
                to: patch.lastPlayedAt
                  ? formatDate(new Date(patch.lastPlayedAt))
                  : format.absent,
                rate: format.taux(patch.winRate),
                count: patch.games,
              }),
            }))}
          />
        </Card>
        <Card
          title={t("section.queues")}
          description={t("section.queuesHelper")}
        >
          <QueuePie queues={data.queues} label={t("queuePie.label")} />
        </Card>
      </Columns>
    </Stack>
  );
}

const detail = (line: StatLineDto, format: ReturnType<typeof useStatsFormat>) =>
  `${format.taux(line.winRate)} · ${line.games}`;
