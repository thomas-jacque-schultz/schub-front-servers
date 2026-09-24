import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyStatsApi } from "../api/statsApi";
import { messageOf, useRequest } from "../../api/useRequest";
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
  Tabs,
  Text,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { useLocalizedNavigate } from "../../i18n/navigation";
import { useProfileStore } from "../../stores/profileStore";
import { MyGamesPanel } from "./stats/MyGamesPanel";
import { PlayerStatsView } from "./stats/PlayerStatsView";
import { StatsStateNote } from "./stats/StatsStateNote";
import { useWindowOptions } from "./stats/windows";

const INGEST_POLL_MS = 30_000;

type Onglet = "overview" | "history";

function StatsPage() {
  const { t } = useTranslation("stats");
  const { formatDateTime } = useLocaleFormat();
  const navigate = useLocalizedNavigate();
  const fenetres = useWindowOptions();
  const {
    profile,
    isLoading,
    reload: reloadProfile,
    ingestInFlight,
  } = useProfileStore();

  const [periode, setPeriode] = useState<string>("");
  const [onglet, setOnglet] = useState<Onglet>("overview");

  const riot = profile?.riot;
  const ouvert = Boolean(riot && riot.state === "RESOLU");
  const {
    data: stats,
    error,
    isLoading: isFetching,
    reload,
  } = useRequest(ouvert ? `me/${periode}` : null, () => getMyStatsApi(periode));

  useEffect(() => {
    if (!ingestInFlight) {
      return;
    }
    const timer = setInterval(() => {
      void reloadProfile();
      void reload();
    }, INGEST_POLL_MS);
    return () => clearInterval(timer);
  }, [ingestInFlight, reloadProfile, reload]);

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

  const overall = stats?.overall;

  return (
    <Stack spacing={3}>
      {header}

      <Stack direction="row" spacing={2} align="center" wrap>
        <SelectField
          label={t("window.label")}
          value={periode}
          onChange={setPeriode}
          options={fenetres}
          helperText={t("window.helper")}
        />
        <Text variant="caption" tone="secondary">
          {t("window.bounded")}
        </Text>
      </Stack>

      <Tabs
        items={[
          { key: "overview", label: t("tabs.overview") },
          { key: "history", label: t("tabs.history") },
        ]}
        value={onglet}
        onChange={(key) => setOnglet(key as Onglet)}
        ariaLabel={t("tabs.ariaLabel")}
      >
        {onglet === "history" && (
          <MyGamesPanel
            periode={periode}
            avatar={profile?.discord.avatarUrl ?? null}
          />
        )}
        {onglet === "overview" && (
          <Stack spacing={3}>
            {isFetching && !stats && <ProgressBar label={t("loading")} />}

            {error !== null && (
              <Alert severity="error">
                {messageOf(error, t("loadFailed"))}
              </Alert>
            )}

            {stats && stats.state === "INGESTION_EN_COURS" && stats.ingest && (
              <Card
                title={t("waiting.title")}
                description={t("waiting.description")}
              >
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
        )}
      </Tabs>
    </Stack>
  );
}

export default StatsPage;
