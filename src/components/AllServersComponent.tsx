import { Alert, Button, Card, CardContent, Chip, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import MemoryIcon from "@mui/icons-material/Memory";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
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
  const onlineCount = servers.filter((server) => server.status === "online").length;

  const refreshLabel = lastRefreshedAt
    ? `Mis à jour ${lastRefreshedAt.toLocaleTimeString()}`
    : "Jamais mis à jour";

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700} color="grey.100">
          Etat des serveurs
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<MemoryIcon />}
            color="success"
            label={`${onlineCount}/${servers.length} en ligne`}
          />
          {connected && onRefresh && (
            <Tooltip title={refreshLabel}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  Actualiser
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {!connected && (
        <Alert severity="info">
          Connecte-toi pour charger les donnees des serveurs.
        </Alert>
      )}

      {error && connected && <Alert severity="warning">{error}</Alert>}

      {isLoading && <LinearProgress />}

      {!isLoading && connected && servers.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="body1">Aucun serveur a afficher.</Typography>
          </CardContent>
        </Card>
      )}

      {servers.map((server) => (
        <Card key={server.name}>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{server.name}</Typography>
                <Chip
                  label={
                    server.status === "online"
                      ? "En ligne"
                      : server.status === "offline"
                        ? "Hors ligne"
                        : server.status === "unreachable"
                          ? "Inaccessible"
                          : "Inconnu"
                  }
                  color={
                    server.status === "online"
                      ? "success"
                      : server.status === "unreachable"
                        ? "error"
                        : "default"
                  }
                />
              </Stack>

              {(server.id || server.slug) && (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {canControl && server.slug && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => onStartServer?.(server.slug || "")}
                        disabled={pendingServerSlug === server.slug}
                      >
                        Start
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PauseIcon />}
                        onClick={() => onStopServer?.(server.slug || "")}
                        disabled={pendingServerSlug === server.slug}
                      >
                        Stop
                      </Button>
                    </>
                  )}
                  {onViewServer && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onViewServer(server.id || server.slug || "")}
                    >
                      Voir
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => onEditServer?.(server.id || server.slug || "")}
                    >
                      Modifier
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