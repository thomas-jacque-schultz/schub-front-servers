import { useTranslation } from "react-i18next";
import {
  Alert,
  Card,
  Columns,
  Divider,
  MeterBar,
  Stack,
  StatGrid,
  StatTile,
  Text,
  TrendChart,
} from "../../../design-system";
import { useLocaleFormat } from "../../../i18n/format";
import type { MyStatsDto, MetricScaleDto, StatLineDto, TeamComparisonDto } from "../../../types/stats";
import { ChampionStatCard } from "./ChampionStatCard";
import { useMetrics } from "./metrics";
import { PlayerRadar } from "./PlayerRadar";
import { rangDeReference } from "./rank";
import { RankedStandings } from "./RankedStandings";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";

const CHAMPIONS_EN_COLONNE = 3;

/** Ce que Mes stats et un joueur d'équipe ont en commun. */
export type PlayerStatsData = Pick<
  MyStatsDto,
  "state" | "coverage" | "overall" | "champions" | "positions" | "queues" | "months" | "rankings" | "radar"
>;

export interface PlayerStatsViewProps {
  data: PlayerStatsData;
  scale: MetricScaleDto | null;
  /** « full » : un joueur sur toute la largeur. « column » : plusieurs joueurs côte à côte. */
  layout: "full" | "column";
  versusTeammates?: TeamComparisonDto | null;
  /** Colonne seulement : le radar ne se lit pas quand les colonnes sont trop étroites. */
  showRadar?: boolean;
}

export function PlayerStatsView(props: PlayerStatsViewProps) {
  return props.layout === "full" ? <Pleine {...props} /> : <Colonne {...props} />;
}

function Pleine({ data, scale, versusTeammates }: PlayerStatsViewProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { formatMonth } = useLocaleFormat();
  const { tuiles } = useMetrics();
  const overall = data.overall;

  if (data.state !== "STATISTIQUES_CONNUES" || !overall) {
    return <StatsStateNote state={data.state} variant="block" />;
  }

  return (
    <Stack spacing={3}>
      <Card>
        <Stack spacing={2}>
          <MeterBar
            label={t("metric.winRate")}
            value={overall.winRate}
            valueLabel={format.taux(overall.winRate)}
            hint={format.assise(data.coverage) ?? undefined}
          />
          <VersusTeammates versus={versusTeammates} />
          <StatGrid items={tuiles(overall, { versus: versusTeammates })} minWidth={130} divided />
          <Text variant="caption" tone="secondary">
            {t("scope.rift")}
          </Text>
        </Stack>
      </Card>

      {data.coverage && !data.coverage.tracked && <Alert severity="info">{t("coverage.untracked")}</Alert>}

      <Columns minWidth={320}>
        <Card title={t("radar.title")} description={t("radar.helper")}>
          <PlayerRadar radar={data.radar} scale={scale} rank={rangDeReference(data.rankings)} />
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
                          delta: format.ecartEnPoints(position.versusRest.winRateDelta),
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

      <Card title={t("section.champions")}>
        {data.champions.length === 0 ? (
          <Text variant="caption" tone="secondary">
            {t("section.noChampion")}
          </Text>
        ) : (
          <Columns minWidth={280}>
            {data.champions.map((line) => (
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
          referenceLabel={t("section.trendReference", { value: format.taux(overall.winRate) })}
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

function Colonne({ data, scale, versusTeammates, showRadar = true }: PlayerStatsViewProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { tuiles } = useMetrics();
  const overall = data.overall;

  return (
    <Stack spacing={1.5}>
      <RankedStandings standings={data.rankings} />
      {data.state !== "STATISTIQUES_CONNUES" || !overall ? (
        <StatsStateNote state={data.state} />
      ) : (
        <>
          <MeterBar
            label={t("metric.winRate")}
            value={overall.winRate}
            valueLabel={format.taux(overall.winRate)}
            hint={format.assise(data.coverage) ?? undefined}
          />
          <VersusTeammates versus={versusTeammates} compact />
          <StatGrid
            items={tuiles(overall, { compact: true, versus: versusTeammates })}
            size="small"
            minWidth={92}
            divided
          />
          {showRadar && (
            <PlayerRadar radar={data.radar} scale={scale} rank={rangDeReference(data.rankings)} />
          )}
          <Divider />
          <Text variant="caption" tone="secondary">
            {t("section.champions")}
          </Text>
          {data.champions.length === 0 ? (
            <Text variant="caption" tone="disabled">
              {t("section.noChampion")}
            </Text>
          ) : (
            <Stack spacing={1}>
              {data.champions.slice(0, CHAMPIONS_EN_COLONNE).map((line) => (
                <ChampionStatCard key={line.key} line={line} compact />
              ))}
            </Stack>
          )}
          {data.queues.length > 0 && (
            <Stack spacing={0.5}>
              <Text variant="caption" tone="secondary">
                {t("section.queues")}
              </Text>
              {data.queues.map((queue) => (
                <MeterBar
                  key={queue.key}
                  label={format.file(queue.key)}
                  value={queue.winRate}
                  valueLabel={`${format.taux(queue.winRate)} · ${t("coverage.gamesShort", {
                    count: queue.games,
                  })}`}
                />
              ))}
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}

function VersusTeammates({ versus, compact = false }: { versus?: TeamComparisonDto | null; compact?: boolean }) {
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

