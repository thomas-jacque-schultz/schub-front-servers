import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { startGameServerApi, stopGameServerApi } from "../../api/serversApi";
import ServersDashboard from "../../components/AllServersComponent";
import { Alert, Button, PageHeader, Stack } from "../../design-system";
import { useLocalizedNavigate } from "../../i18n/navigation";
import { useAuthStore } from "../../stores/authStore";
import { useServersStore } from "../../stores/serversStore";
import type { DisplayedServer } from "../../types/server";

const REFRESH_INTERVAL_MS = 30_000;

/**
 * Les fiches serveurs, sous le menu *Configuration*.
 *
 * <p><strong>Démarrer et arrêter ne sont plus proposés à tout compte connecté.</strong> Ils
 * l'étaient parce que le front n'avait aucun moyen de savoir qui figure dans les `admins` d'un
 * serveur : masquer les boutons sur la seule foi des permissions de rôle aurait retiré à un
 * administrateur de serveur ce que le cœur lui accorde (décision n°11 du 18-09). Le cœur expose
 * désormais `viewerIsAdmin` sur chaque projection, et la question se pose serveur par serveur.</p>
 *
 * <p>La règle recopie exactement celle du cœur (`PermissionEvaluator`) : autorité du rôle
 * <em>union</em> `START`/`STOP` sur les serveurs dont on est administrateur. L'autorité reste le
 * cœur — il refuse vraiment — ce qui se joue ici est qu'un visiteur ne clique plus sur un bouton
 * pour récolter un 403.</p>
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
   * Le droit d'agir sur *ce* serveur.
   *
   * <p>`SERVER_START` et `SERVER_STOP` sont testées séparément par le cœur, mais les deux
   * boutons vont ensemble dans la carte : exiger l'une ou l'autre afficherait la paire à qui ne
   * peut qu'en actionner une. Exiger les deux du rôle serait faux dans l'autre sens, puisque
   * l'administrateur du serveur les obtient toutes les deux d'un coup — d'où le `||`.</p>
   */
  const canControlServer = useCallback(
    (server: DisplayedServer) =>
      server.viewerIsAdmin || (can("SERVER_START") && can("SERVER_STOP")),
    [can],
  );

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

      {/* L'absence des ports et des admins n'est pas une panne : c'est la projection membre. */}
      {!can("SERVER_INFRA_VIEW") && <Alert severity="info">{t("list.memberView")}</Alert>}

      <ServersDashboard
        servers={servers}
        isLoading={isLoading}
        error={error}
        connected={connected}
        canControlServer={canControlServer}
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
