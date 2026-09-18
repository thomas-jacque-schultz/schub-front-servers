import { Alert, Card, CardContent, Chip, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import MemoryIcon from "@mui/icons-material/Memory";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useTranslation } from "react-i18next";
import { Button, EmptyState, StatusChip } from "../design-system";
import { useLocaleFormat } from "../i18n/format";
import type { DisplayedServer } from "../types/server";

interface ServersDashboardProps {
  servers: DisplayedServer[];
  isLoading: boolean;
  error: string;
  connected: boolean;
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
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>
          {t("list.title")}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<MemoryIcon />}
            color="success"
            label={t("list.onlineCount", { online: onlineCount, total: servers.length })}
          />
          {connected && onRefresh && (
            <Tooltip title={refreshLabel}>
              <span>
                <Button
                  size="small"
                  variant="secondary"
                  startIcon={<RefreshIcon />}
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  {t("actions.refresh", { ns: "common" })}
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {!connected && <Alert severity="info">{t("list.notConnected")}</Alert>}

      {error && connected && <Alert severity="warning">{error}</Alert>}

      {isLoading && <LinearProgress />}

      {!isLoading && connected && servers.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState title={t("list.emptyTitle")} description={t("list.emptyDescription")} />
          </CardContent>
        </Card>
      )}

      {servers.map((server) => (
        <Card key={server.name}>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{server.name}</Typography>
                <StatusChip status={server.status} />
              </Stack>

              {(server.id || server.slug) && (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {canControl && server.slug && (
                    <>
                      <Button
                        size="small"
                        variant="secondary"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => onStartServer?.(server.slug || "")}
                        disabled={pendingServerSlug === server.slug}
                      >
                        {t("list.actions.start")}
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        startIcon={<PauseIcon />}
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
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export default ServersDashboard;
