import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyStatsApi } from "../../api/statsApi";
import {
  Alert,
  Button,
  Card,
  Divider,
  EmptyState,
  PageHeader,
  ProgressBar,
  SelectField,
  Stack,
  Text,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { useLocalizedNavigate } from "../../i18n/navigation";
import { useProfileStore } from "../../stores/profileStore";
import type { MyStatsDto } from "../../types/stats";
import { PlayerStatsView } from "./stats/PlayerStatsView";
import { StatsStateNote } from "./stats/StatsStateNote";
import { useWindowOptions } from "./stats/windows";

const INGEST_POLL_MS = 30_000;

function StatsPage() {
  const { t } = useTranslation("stats");
  const { formatDateTime } = useLocaleFormat();
  const navigate = useLocalizedNavigate();
  const fenetres = useWindowOptions();
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
          <PlayerStatsView data={stats} />
          <Divider />
          <Text variant="caption" tone="secondary">
            {t("footnote")}
          </Text>
        </>
      )}
    </Stack>
  );
}

export default StatsPage;
