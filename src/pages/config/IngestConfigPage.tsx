import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCrawlerApi, getIngestLoadApi, toggleCrawlerApi } from "../../api/ingestApi";
import {
  Alert,
  Card,
  MeterBar,
  PageHeader,
  ProgressBar,
  Stack,
  StatGrid,
  Switch,
  Text,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { useAuthStore } from "../../stores/authStore";
import type { CrawlerDto, IngestLoadDto } from "../../types/ingest";

const GO = 1_000_000_000;

function IngestConfigPage() {
  const { t } = useTranslation("riot");
  const { formatNumber, formatDateTime } = useLocaleFormat();
  const { can } = useAuthStore();

  const [load, setLoad] = useState<IngestLoadDto | null>(null);
  const [crawler, setCrawler] = useState<CrawlerDto | null>(null);
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [charge, fond] = await Promise.all([getIngestLoadApi(), getCrawlerApi()]);
      setLoad(charge);
      setCrawler(fond);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("ingest.loadFailed"));
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onToggle = async (enabled: boolean) => {
    setIsSaving(true);
    setError("");
    try {
      setCrawler(await toggleCrawlerApi(enabled));
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : t("ingest.toggleFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const go = (octets: number) =>
    t("ingest.gigabytes", { value: formatNumber(Math.round((octets / GO) * 10) / 10) });

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
          <Card title={t("ingest.queue.title")} description={t("ingest.queue.description")}>
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
          </Card>

          <Card title={t("ingest.crawler.title")} description={t("ingest.crawler.description")}>
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
                  {t("ingest.crawler.storageAlert", { threshold: go(crawler.storageAlertBytes) })}
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
                      ? t("ingest.crawler.lastRoundAccounts", { count: crawler.lastRoundAccounts })
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
        </>
      )}
    </Stack>
  );
}

export default IngestConfigPage;
