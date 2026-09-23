import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { startGameServerApi, stopGameServerApi } from "../api/serversApi";
import ServersDashboard from "../components/AllServersComponent";
import { Card, PageHeader, Stack } from "../design-system";
import { useAuthStore } from "../stores/authStore";
import { useServersStore } from "../stores/serversStore";

const REFRESH_INTERVAL_MS = 30_000;

function LandingPage() {
  const { t } = useTranslation("servers");
  const { connected, can } = useAuthStore();
  const { servers, isLoading, error, lastRefreshedAt, loadServers, loadPublicServers } =
    useServersStore();
  const [pendingServerSlug, setPendingServerSlug] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void (connected ? loadServers() : loadPublicServers());
  }, [connected, loadServers, loadPublicServers]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const canControl = can("SERVER_START") && can("SERVER_STOP");

  const runServerAction = async (slug: string, action: (slug: string) => Promise<void>) => {
    setPendingServerSlug(slug);
    try {
      await action(slug);
      await loadServers();
    } finally {
      setPendingServerSlug(null);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("landing.eyebrow")}
        title={t("landing.title")}
        subtitle={t("landing.description")}
      />

      <Card>
        <ServersDashboard
          servers={servers}
          isLoading={isLoading}
          error={error}
          connected
          canControl={canControl}
          lastRefreshedAt={lastRefreshedAt}
          onRefresh={refresh}
          onStartServer={(slug) => void runServerAction(slug, startGameServerApi)}
          onStopServer={(slug) => void runServerAction(slug, stopGameServerApi)}
          pendingServerSlug={pendingServerSlug}
        />
      </Card>
    </Stack>
  );
}

export default LandingPage;
