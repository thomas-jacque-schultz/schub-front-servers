import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getCrawlerApi,
  getIngestLoadApi,
  getIngestSummaryApi,
  toggleCrawlerApi,
} from "../../api/ingestApi";
import {
  Alert,
  Card,
  DataTable,
  Disclosure,
  MeterBar,
  PageHeader,
  ProgressBar,
  Stack,
  StatGrid,
  Switch,
  Text,
  useAuthStore,
  useLocaleFormat,
} from "../../../common";
import { AugurTrace } from "../../components/AugurTrace";
import { HistoryWindowCard } from "../../components/HistoryWindowCard";
import type {
  CrawlerDto,
  IngestCountsDto,
  IngestLoadDto,
  IngestSummaryDto,
} from "../../types/ingest";

const GO = 1_000_000_000;

interface SummaryRow {
  key: "matches" | "profiles";
  counts: IngestCountsDto;
}

function IngestConfigPage() {
  const { t } = useTranslation("riot");
  const { formatNumber, formatDateTime } = useLocaleFormat();
  const { can } = useAuthStore();
  const canManage = can("INGEST_MANAGE");

  const [load, setLoad] = useState<IngestLoadDto | null>(null);
  const [summary, setSummary] = useState<IngestSummaryDto | null>(null);
  const [crawler, setCrawler] = useState<CrawlerDto | null>(null);
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [debugOpen, setDebugOpen] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [charge, fond, bilan] = await Promise.all([
        getIngestLoadApi(),
        getCrawlerApi(),
        canManage ? getIngestSummaryApi() : Promise.resolve(null),
      ]);
      setLoad(charge);
      setCrawler(fond);
      setSummary(bilan);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("ingest.loadFailed"),
      );
    }
  }, [t, canManage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onToggle = async (enabled: boolean) => {
    setIsSaving(true);
    setError("");
    try {
      setCrawler(await toggleCrawlerApi(enabled));
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : t("ingest.toggleFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const go = (octets: number) =>
    t("ingest.gigabytes", {
      value: formatNumber(Math.round((octets / GO) * 10) / 10),
    });

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("ingest.eyebrow")}
        title={t("ingest.title")}
        subtitle={t("ingest.subtitle")}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {!load || !crawler ? (
        !error && <ProgressBar label={t("ingest.title")} />
      ) : !load.available || !crawler.available ? (
        <Alert severity="warning">{t("ingest.unavailable")}</Alert>
      ) : (
        <>
          {summary && (
            <Card
              title={t("ingest.summary.title")}
              description={t("ingest.summary.description")}
            >
              {summary.available ? (
                <DataTable<SummaryRow>
                  dense
                  caption={t("ingest.summary.title")}
                  emptyTitle={t("ingest.unavailable")}
                  rows={[
                    { key: "matches", counts: summary.matches },
                    { key: "profiles", counts: summary.profiles },
                  ]}
                  rowKey={(row) => row.key}
                  columns={[
                    {
                      key: "kind",
                      header: t("ingest.summary.kind"),
                      render: (row) => (
                        <Text variant="subtitle">
                          {t(`ingest.summary.${row.key}`)}
                        </Text>
                      ),
                    },
                    {
                      key: "retrieved",
                      header: t("ingest.summary.retrieved"),
                      headerHint: t("ingest.summary.retrievedHint"),
                      align: "right",
                      render: (row) => (
                        <Text mono>{formatNumber(row.counts.retrieved)}</Text>
                      ),
                    },
                    {
                      key: "analysed",
                      header: t("ingest.summary.analysed"),
                      headerHint: t("ingest.summary.analysedHint"),
                      align: "right",
                      render: (row) => (
                        <Text mono>{formatNumber(row.counts.analysed)}</Text>
                      ),
                    },
                    {
                      key: "pending",
                      header: t("ingest.summary.pending"),
                      headerHint: t("ingest.summary.pendingHint"),
                      align: "right",
                      render: (row) => (
                        <Text mono>{formatNumber(row.counts.pending)}</Text>
                      ),
                    },
                  ]}
                />
              ) : (
                <Alert severity="warning">{t("ingest.unavailable")}</Alert>
              )}
            </Card>
          )}

          <Card
            title={t("ingest.crawler.title")}
            description={t("ingest.crawler.description")}
          >
            <Stack spacing={2}>
              {crawler.switchable ? (
                <Switch
                  checked={crawler.enabled}
                  onChange={(enabled) => void onToggle(enabled)}
                  label={t("ingest.crawler.toggle")}
                  helperText={t("ingest.crawler.toggleHelper")}
                  disabled={isSaving || !can("INGEST_MANAGE")}
                />
              ) : (
                <Text tone="secondary">{t("ingest.crawler.alwaysOn")}</Text>
              )}
              {crawler.storageAlert && (
                <Alert severity="error">
                  {t("ingest.crawler.storageAlert", {
                    threshold: go(crawler.storageAlertBytes),
                  })}
                </Alert>
              )}
              <StatGrid
                items={[
                  {
                    key: "known",
                    label: t("ingest.crawler.known"),
                    value: formatNumber(crawler.knownAccounts),
                  },
                  {
                    key: "tracked",
                    label: t("ingest.crawler.tracked"),
                    value: formatNumber(crawler.trackedAccounts),
                  },
                  {
                    key: "backlog",
                    label: t("ingest.crawler.backlog"),
                    value: formatNumber(crawler.backgroundPending),
                  },
                  {
                    key: "lastRound",
                    label: t("ingest.crawler.lastRound"),
                    value: crawler.lastRoundAt
                      ? formatDateTime(new Date(crawler.lastRoundAt))
                      : "—",
                    hint: crawler.lastRoundAt
                      ? t("ingest.crawler.lastRoundAccounts", {
                          count: crawler.lastRoundAccounts,
                        })
                      : undefined,
                  },
                ]}
              />
              <MeterBar
                value={
                  crawler.storageAlertBytes > 0
                    ? crawler.databaseBytes / crawler.storageAlertBytes
                    : null
                }
                label={t("ingest.crawler.storage")}
                valueLabel={t("ingest.crawler.storageValue", {
                  used: go(crawler.databaseBytes),
                  threshold: go(crawler.storageAlertBytes),
                })}
                hint={t("ingest.crawler.storageHint")}
              />
            </Stack>
          </Card>

          <HistoryWindowCard />

          <Disclosure
            title={t("ingest.debug.title")}
            open={debugOpen}
            onToggle={setDebugOpen}
          >
            <Stack spacing={2}>
              <Text variant="subtitle">{t("ingest.debug.queue")}</Text>
              <Text tone="secondary" variant="caption">
                {t("ingest.queue.description")}
              </Text>
              <StatGrid
                divided
                items={[
                  {
                    key: "pending",
                    label: t("ingest.queue.pending"),
                    value: formatNumber(load.pending),
                  },
                  {
                    key: "running",
                    label: t("ingest.queue.running"),
                    value: formatNumber(load.running),
                  },
                  {
                    key: "failed",
                    label: t("ingest.queue.failed"),
                    value: formatNumber(load.failed),
                  },
                  {
                    key: "rate",
                    label: t("ingest.queue.rate"),
                    value: formatNumber(Math.round(load.callsPerMinute)),
                  },
                  {
                    key: "ready",
                    label: t("ingest.queue.readyAt"),
                    value: load.estimatedReadyAt
                      ? formatDateTime(new Date(load.estimatedReadyAt))
                      : "—",
                  },
                ]}
              />
              {can("INGEST_MANAGE") ? (
                <AugurTrace />
              ) : (
                <Text tone="secondary">{t("ingest.debug.empty")}</Text>
              )}
            </Stack>
          </Disclosure>
        </>
      )}
    </Stack>
  );
}

export default IngestConfigPage;
