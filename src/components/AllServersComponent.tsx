import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Chip,
  EmptyState,
  Icon,
  ProgressBar,
  Stack,
  StatusChip,
  Text,
  Tooltip,
} from "../design-system";
import { useLocaleFormat } from "../i18n/format";
import type { DisplayedServer } from "../types/server";

interface ServersDashboardProps {
  servers: DisplayedServer[];
  isLoading: boolean;
  error: string;
  connected: boolean;
  /** Le lecteur peut-il démarrer et arrêter ? Vient du rôle, donc vaut pour tous les serveurs. */
  canControl?: boolean;
  canEdit?: boolean;
  lastRefreshedAt?: Date | null;
  onRefresh?: () => void;
  onViewServer?: (serverId: string) => void;
  onEditServer?: (serverId: string) => void;
  onStartServer?: (serverSlug: string) => void;
  onStopServer?: (serverSlug: string) => void;
  pendingServerSlug?: string | null;
}

/**
 * La liste des serveurs, telle qu'elle s'affiche sur `/servers` et dans les écrans
 * d'administration.
 *
 * <p>Démarrer et arrêter s'affichent dès que le rôle les porte : c'est ici que le modérateur les
 * trouve, sur la page qu'il ouvre pour voir l'état de ses serveurs. Ils n'ont jamais été
 * atteignables depuis l'onglet Configuration, qu'il ne voit pas.</p>
 */
function ServersDashboard({
  servers,
  isLoading,
  error,
  connected,
  canControl = false,
  canEdit = false,
  lastRefreshedAt,
  onRefresh,
  onViewServer,
  onEditServer,
  onStartServer,
  onStopServer,
  pendingServerSlug,
}: ServersDashboardProps) {
  const { t } = useTranslation("servers");
  const { formatTime } = useLocaleFormat();
  const onlineCount = servers.filter((server) => server.status === "online").length;

  const refreshLabel = lastRefreshedAt
    ? t("list.lastRefresh", { time: formatTime(lastRefreshedAt) })
    : t("list.neverRefreshed");

  return (
    <Stack spacing={2}>
      <Stack direction="row" justify="between" align="center">
        <Text variant="section">{t("list.title")}</Text>
        <Stack direction="row" spacing={1} align="center">
          <Chip
            tone="success"
            icon={<Icon name="memory" size="small" />}
            label={t("list.onlineCount", { online: onlineCount, total: servers.length })}
          />
          {connected && onRefresh && (
            <Tooltip title={refreshLabel}>
              <Button
                size="small"
                variant="secondary"
                startIcon={<Icon name="refresh" size="small" />}
                onClick={onRefresh}
                disabled={isLoading}
              >
                {t("actions.refresh", { ns: "common" })}
              </Button>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {!connected && <Alert severity="info">{t("list.notConnected")}</Alert>}

      {error && connected && <Alert severity="warning">{error}</Alert>}

      {isLoading && <ProgressBar label={t("list.title")} />}

      {!isLoading && connected && servers.length === 0 && (
        <Card>
          <EmptyState title={t("list.emptyTitle")} description={t("list.emptyDescription")} />
        </Card>
      )}

      {servers.map((server) => (
        <Card key={server.name}>
          <Stack spacing={2}>
            <Stack direction="row" justify="between" align="center">
              <Text variant="subtitle">{server.name}</Text>
              <StatusChip status={server.status} />
            </Stack>

            {(server.id || server.slug) && (
              <Stack direction="row" spacing={1} justify="end">
                {server.slug && canControl && (
                  <>
                    <Button
                      size="small"
                      variant="secondary"
                      startIcon={<Icon name="play" size="small" />}
                      onClick={() => onStartServer?.(server.slug || "")}
                      disabled={pendingServerSlug === server.slug}
                    >
                      {t("list.actions.start")}
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      startIcon={<Icon name="pause" size="small" />}
                      onClick={() => onStopServer?.(server.slug || "")}
                      disabled={pendingServerSlug === server.slug}
                    >
                      {t("list.actions.stop")}
                    </Button>
                  </>
                )}
                {onViewServer && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => onViewServer(server.id || server.slug || "")}
                  >
                    {t("list.actions.view")}
                  </Button>
                )}
                {canEdit && (
                  <Button size="small" onClick={() => onEditServer?.(server.id || server.slug || "")}>
                    {t("list.actions.edit")}
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

export default ServersDashboard;
