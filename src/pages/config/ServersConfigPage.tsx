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
 * <p>Le démarrage et l'arrêt restent proposés à tout compte connecté, et c'est voulu : figurer
 * dans les {@code admins} d'un serveur donne ce droit sur <em>ce</em> serveur sans que le rôle
 * porte {@code SERVER_START} (décision n°11 du 18-09). Le front ne connaît pas cette liste — le
 * cœur, seul, l'évalue au point d'action. Masquer les boutons sur la foi des permissions de rôle
 * retirerait donc à un administrateur de serveur ce que le cœur lui accorde.</p>
 */
function ServersConfigPage() {
  const { t } = useTranslation("servers");
  const navigate = useLocalizedNavigate();
  const { accessToken, connected, can } = useAuthStore();
  const { servers, isLoading, error, lastRefreshedAt, loadServers } = useServersStore();
  const [pendingServerSlug, setPendingServerSlug] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (accessToken) {
      void loadServers(accessToken);
    }
  }, [accessToken, loadServers]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const runServerAction = async (slug: string, action: (token: string, slug: string) => Promise<void>) => {
    if (!accessToken) {
      return;
    }
    setPendingServerSlug(slug);
    try {
      await action(accessToken, slug);
      await loadServers(accessToken);
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

      {/* L'absence des ports et des admins n'est pas une panne : c'est la projection membre. */}
      {!can("SERVER_INFRA_VIEW") && <Alert severity="info">{t("list.memberView")}</Alert>}

      <ServersDashboard
        servers={servers}
        isLoading={isLoading}
        error={error}
        connected={connected}
        canControl={connected}
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
