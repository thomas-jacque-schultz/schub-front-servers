import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { startGameServerApi, stopGameServerApi } from "../../api/serversApi";
import ServersDashboard from "../../components/AllServersComponent";
import {
  Alert,
  Button,
  Card,
  IconButton,
  PageHeader,
  Stack,
  useAuthStore,
  useLocalizedNavigate,
} from "../../../common";
import { useServersStore } from "../../stores/serversStore";

const REFRESH_INTERVAL_MS = 30_000;

function ServersPage() {
  const { t } = useTranslation("servers");
  const navigate = useLocalizedNavigate();
  const { connected, can, canAny } = useAuthStore();
  const {
    servers,
    isLoading,
    error,
    lastRefreshedAt,
    loadServers,
    loadPublicServers,
  } = useServersStore();
  const [pendingServerSlug, setPendingServerSlug] = useState<string | null>(
    null,
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const canEnterEdit = canAny(
    "SERVER_CREATE",
    "SERVER_EDIT",
    "SERVER_INFRA_VIEW",
  );
  const editing = canEnterEdit && searchParams.has("edit");

  const refresh = useCallback(() => {
    void (connected ? loadServers() : loadPublicServers());
  }, [connected, loadServers, loadPublicServers]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const canControl = can("SERVER_START") && can("SERVER_STOP");

  const runServerAction = async (
    slug: string,
    action: (slug: string) => Promise<void>,
  ) => {
    setPendingServerSlug(slug);
    try {
      await action(slug);
      await loadServers();
    } finally {
      setPendingServerSlug(null);
    }
  };

  const dashboard = (
    <ServersDashboard
      servers={servers}
      isLoading={isLoading}
      error={error}
      connected
      canControl={canControl}
      canEdit={editing && can("SERVER_EDIT")}
      lastRefreshedAt={lastRefreshedAt}
      onRefresh={refresh}
      onViewServer={
        editing
          ? (serverId) => navigate(`/gameServeur/${serverId}/view`)
          : undefined
      }
      onEditServer={(serverId) => navigate(`/gameServeur/${serverId}/edit`)}
      onStartServer={(slug) => void runServerAction(slug, startGameServerApi)}
      onStopServer={(slug) => void runServerAction(slug, stopGameServerApi)}
      pendingServerSlug={pendingServerSlug}
    />
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("landing.eyebrow")}
        title={t("landing.title")}
        subtitle={t("landing.description")}
        actions={
          canEnterEdit ? (
            <Stack direction="row" spacing={1} align="center">
              {editing && can("SERVER_CREATE") && (
                <Button onClick={() => navigate("/gameServeur/create")}>
                  {t("admin.createServer")}
                </Button>
              )}
              <IconButton
                icon={editing ? "done" : "edit"}
                label={editing ? t("list.editDone") : t("list.editMode")}
                onClick={() => setSearchParams(editing ? {} : { edit: "" })}
              />
            </Stack>
          ) : undefined
        }
      />

      {editing ? (
        <>
          {!can("SERVER_INFRA_VIEW") && (
            <Alert severity="info">{t("list.memberView")}</Alert>
          )}
          {dashboard}
        </>
      ) : (
        <Card>{dashboard}</Card>
      )}
    </Stack>
  );
}

export default ServersPage;
