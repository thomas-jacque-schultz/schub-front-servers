import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { startGameServerApi, stopGameServerApi } from "../../api/serversApi";
import ServersDashboard from "../../components/AllServersComponent";
import { Alert, Button, PageHeader, Stack } from "../../design-system";
import { useLocalizedNavigate } from "../../i18n/navigation";
import { useAuthStore } from "../../stores/authStore";
import { useServersStore } from "../../stores/serversStore";

const REFRESH_INTERVAL_MS = 30_000;

/**
 * Les fiches serveurs, sous le menu *Configuration*.
 *
 * <p>Démarrer et arrêter s'y trouvent aussi, mais cet écran n'est pas leur adresse : il exige
 * `SERVER_CREATE`, `SERVER_EDIT` ou `SERVER_INFRA_VIEW`, qu'un modérateur n'a pas. La page des
 * serveurs les porte, et c'est là qu'il les trouve.</p>
 */
function ServersConfigPage() {
  const { t } = useTranslation("servers");
  const navigate = useLocalizedNavigate();
  const { connected, can } = useAuthStore();
  const { servers, isLoading, error, lastRefreshedAt, loadServers } = useServersStore();
  const [pendingServerSlug, setPendingServerSlug] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void loadServers();
  }, [loadServers]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  /**
   * Les deux boutons vont ensemble dans la carte : exiger l'une ou l'autre permission
   * afficherait la paire à qui ne peut en actionner qu'une.
   */
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
        eyebrow={t("config.eyebrow")}
        title={t("config.serversTitle")}
        subtitle={t("config.serversSubtitle")}
        actions={
          can("SERVER_CREATE") ? (
            <Button onClick={() => navigate("/gameServeur/create")}>{t("admin.createServer")}</Button>
          ) : undefined
        }
      />

      {/* L'absence des ports n'est pas une panne : c'est la projection membre. */}
      {!can("SERVER_INFRA_VIEW") && <Alert severity="info">{t("list.memberView")}</Alert>}

      <ServersDashboard
        servers={servers}
        isLoading={isLoading}
        error={error}
        connected={connected}
        canControl={canControl}
        canEdit={can("SERVER_EDIT")}
        lastRefreshedAt={lastRefreshedAt}
        onRefresh={refresh}
        onViewServer={(serverId) => navigate(`/gameServeur/${serverId}/view`)}
        onEditServer={(serverId) => navigate(`/gameServeur/${serverId}/edit`)}
        onStartServer={(slug) => void runServerAction(slug, startGameServerApi)}
        onStopServer={(slug) => void runServerAction(slug, stopGameServerApi)}
        pendingServerSlug={pendingServerSlug}
      />
    </Stack>
  );
}

export default ServersConfigPage;
