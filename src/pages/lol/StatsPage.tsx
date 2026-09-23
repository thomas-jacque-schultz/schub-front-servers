import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyStatsApi } from "../../api/statsApi";
import {
  Alert,
  Button,
  Card,
  Columns,
  Divider,
  EmptyState,
  MeterBar,
  PageHeader,
  ProgressBar,
  SelectField,
  Stack,
  StatGrid,
  Text,
  TrendChart,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { useLocalizedNavigate } from "../../i18n/navigation";
import { useProfileStore } from "../../stores/profileStore";
import type { MyStatsDto, StatLineDto } from "../../types/stats";
import { ChampionStatCard } from "./stats/ChampionStatCard";
import { useMetrics } from "./stats/metrics";
import { PlayerRadar } from "./stats/PlayerRadar";
import { rangDeReference } from "./stats/rank";
import { RankedStandings } from "./stats/RankedStandings";
import { StatsStateNote } from "./stats/StatsStateNote";
import { useStatsFormat } from "./stats/statsFormat";
import { useWindowOptions } from "./stats/windows";

const INGEST_POLL_MS = 30_000;

function StatsPage() {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { formatDateTime, formatMonth } = useLocaleFormat();
  const navigate = useLocalizedNavigate();
  const fenetres = useWindowOptions();
  const { tuiles } = useMetrics();
  const { profile, isLoading, reload, ingestInFlight } = useProfileStore();

  const [days, setDays] = useState<string>("");
  const [stats, setStats] = useState<MyStatsDto | null>(null);
  const [error, setError] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const riot = profile?.riot;
  const ouvert = Boolean(riot && riot.state === "RESOLU");

  const load = useCallback(async () => {
    if (!ouvert) {
      return;
    }
    setIsFetching(true);
    setError("");
    try {
      setStats(await getMyStatsApi(days ? Number(days) : null));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("loadFailed"),
      );
    } finally {
      setIsFetching(false);
    }
  }, [ouvert, days, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!ingestInFlight) {
      return;
    }
    const timer = setInterval(() => {
      void reload();
      void load();
    }, INGEST_POLL_MS);
    return () => clearInterval(timer);
  }, [ingestInFlight, reload, load]);

  if (isLoading && !profile) {
    return <ProgressBar label={t("title")} />;
  }

  const header = (
    <PageHeader
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitle")}
    />
  );

  if (!riot || riot.state === "ABSENT") {
    return (
      <Stack spacing={3}>
        {header}
        <Card>
          <EmptyState
            title={t("locked.title")}
            description={t("locked.description")}
            action={
              <Button onClick={() => navigate("/profile")}>
                {t("locked.action")}
              </Button>
            }
          />
        </Card>
      </Stack>
    );
  }

  if (riot.state === "EN_ATTENTE_DE_RESOLUTION") {
    return (
      <Stack spacing={3}>
        {header}
        <Card>
          <EmptyState
            title={t("pending.title")}
            description={t("pending.description")}
            action={
              <Button variant="secondary" onClick={() => navigate("/profile")}>
                {t("pending.action")}
              </Button>
            }
          />
        </Card>
      </Stack>
    );
  }

  if (isFetching && !stats) {
    return (
      <Stack spacing={3}>
        {header}
        <ProgressBar label={t("loading")} />
      </Stack>
    );
  }

  const overall = stats?.overall;

  return (
    <Stack spacing={3}>
      {header}

      <Stack direction="row" spacing={2} align="center" wrap>
        <SelectField
          label={t("window.label")}
          value={days}
          onChange={setDays}
          options={fenetres}
          helperText={t("window.helper")}
        />
        <Text variant="caption" tone="secondary">
          {t("window.bounded")}
        </Text>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {stats && stats.state === "INGESTION_EN_COURS" && stats.ingest && (
        <Card title={t("waiting.title")} description={t("waiting.description")}>
          <Stack spacing={1.5}>
            <ProgressBar label={t("waiting.progressLabel")} />
            <Text variant="caption" tone="secondary">
              {t("waiting.pending", { count: stats.ingest.pending })}
            </Text>
            <Text variant="subtitle">
              {stats.ingest.estimatedReadyAt
                ? t("waiting.readyAt", {
                    date: formatDateTime(
                      new Date(stats.ingest.estimatedReadyAt),
                    ),
                  })
                : t("waiting.readyUnknown")}
            </Text>
          </Stack>
        </Card>
      )}

      {stats &&
        stats.state !== "STATISTIQUES_CONNUES" &&
        stats.state !== "INGESTION_EN_COURS" && (
          <StatsStateNote state={stats.state} variant="block" />
        )}

      {stats && overall && stats.state === "STATISTIQUES_CONNUES" && (
        <>
          <Card>
            <Stack spacing={2}>
              <MeterBar
                label={t("metric.winRate")}
                value={overall.winRate}
                valueLabel={format.taux(overall.winRate)}
                hint={format.assise(stats.coverage) ?? undefined}
              />
              <StatGrid items={tuiles(overall)} minWidth={130} divided />
              <Text variant="caption" tone="secondary">
                {t("scope.rift")}
              </Text>
            </Stack>
          </Card>

          {stats.coverage && !stats.coverage.tracked && (
            <Alert severity="info">{t("coverage.untracked")}</Alert>
          )}

          <Columns minWidth={320}>
            <Card title={t("radar.title")} description={t("radar.helper")}>
              <PlayerRadar
                radar={stats.radar}
                scale={stats.scale}
                rank={rangDeReference(stats.rankings)}
              />
            </Card>
            <Stack spacing={2}>
              <Card title={t("section.rankings")}>
                <RankedStandings standings={stats.rankings} />
              </Card>
              <Card title={t("section.positions")}>
                <Stack spacing={0.75}>
                  {stats.positions.map((position) => (
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
            {stats.champions.length === 0 ? (
              <Text variant="caption" tone="secondary">
                {t("section.noChampion")}
              </Text>
            ) : (
              <Columns minWidth={280}>
                {stats.champions.map((line) => (
                  <ChampionStatCard key={line.key} line={line} />
                ))}
              </Columns>
            )}
          </Card>

          <Card
            title={t("section.trend")}
            description={t("section.trendHelper")}
          >
            <TrendChart
              label={t("metric.winRate")}
              valueHeader={t("metric.winRate")}
              emptyLabel={t("section.noMonth")}
              scaleMax={1}
              reference={overall.winRate}
              referenceLabel={t("section.trendReference", {
                value: format.taux(overall.winRate),
              })}
              points={stats.months.map((month) => ({
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
              {stats.queues.map((queue) => (
                <MeterBar
                  key={queue.key}
                  label={format.file(queue.key)}
                  value={queue.winRate}
                  valueLabel={detail(queue, format)}
                />
              ))}
            </Stack>
          </Card>

          <Divider />
          <Text variant="caption" tone="secondary">
            {t("footnote")}
          </Text>
        </>
      )}
    </Stack>
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

export default StatsPage;
