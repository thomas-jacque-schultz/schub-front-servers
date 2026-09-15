import { useEffect, useCallback, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getDiscordGuildChannelsApi, subscribeDiscordChannelsApi } from "../api/discordApi";
import { startGamingServerApi, stopGamingServerApi } from "../api/serversApi";
import AdminActionBar from "../components/AdminActionBar";
import ServersDashboard from "../components/AllServersComponent";
import PortForwardingCard from "../components/PortForwardingCard";
import DiscordChannelsCard from "../components/DiscordChannelsCard";
import { useAuthStore } from "../stores/authStore";
import { useServersStore } from "../stores/serversStore";
import type { DiscordChannelSelection, DiscordGuildChannelsDto } from "../types/discord";

const REFRESH_INTERVAL_MS = 30_000;

function DashboardPage() {
  const navigate = useNavigate();
  const { accessToken, profile, isAdmin, logout } = useAuthStore();
  const { servers, isLoading, error: serversError, lastRefreshedAt, loadServers, resetServers } =
    useServersStore();
  const [guilds, setGuilds] = useState<DiscordGuildChannelsDto[]>([]);
  const [isLoadingGuilds, setIsLoadingGuilds] = useState<boolean>(false);
  const [guildsError, setGuildsError] = useState<string>("");
  const [pendingServerIdentifier, setPendingServerIdentifier] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (accessToken && profile) void loadServers(accessToken);
  }, [accessToken, profile, loadServers]);

  useEffect(() => {
    if (!accessToken || !profile) {
      resetServers();
      setGuilds([]);
      setGuildsError("");
      return;
    }
    void loadServers(accessToken);
    void (async () => {
      setIsLoadingGuilds(true);
      setGuildsError("");

      try {
        const payload = await getDiscordGuildChannelsApi(accessToken);
        setGuilds(payload);
      } catch (error) {
        setGuildsError(error instanceof Error ? error.message : "Impossible de charger les canaux Discord");
      } finally {
        setIsLoadingGuilds(false);
      }
    })();

    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [accessToken, profile, loadServers, resetServers, refresh]);

  const onSubmitDiscordChannelSelection = async (selection: DiscordChannelSelection[]) => {
    if (!accessToken) {
      return;
    }

    await subscribeDiscordChannelsApi(accessToken, selection);
    const [updatedGuilds] = await Promise.all([
      getDiscordGuildChannelsApi(accessToken),
      loadServers(accessToken),
    ]);
    setGuilds(updatedGuilds);
  };

  const onLogout = () => {
    resetServers();
    logout();
    navigate("/", { replace: true });
  };

  const onViewServer = (serverId: string) => {
    navigate(`/gameServeur/${serverId}/view`);
  };

  const onEditServer = (serverId: string) => {
    navigate(`/gameServeur/${serverId}/edit`);
  };

  const onStartServer = async (serverIdentifier: string) => {
    if (!accessToken) {
      return;
    }

    setPendingServerIdentifier(serverIdentifier);
    try {
      await startGamingServerApi(accessToken, serverIdentifier);
      await loadServers(accessToken);
    } finally {
      setPendingServerIdentifier(null);
    }
  };

  const onStopServer = async (serverIdentifier: string) => {
    if (!accessToken) {
      return;
    }

    setPendingServerIdentifier(serverIdentifier);
    try {
      await stopGamingServerApi(accessToken, serverIdentifier);
      await loadServers(accessToken);
    } finally {
      setPendingServerIdentifier(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(7,16,25,1) 0%, rgba(10,22,34,1) 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
          >
            <Typography variant="h4" color="white" fontWeight={700}>
              Pilotage des serveurs
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip color="primary" label={`Connecte: ${profile?.username ?? "-"}`} />
              <Button variant="outlined" color="inherit" onClick={onLogout}>
                Deconnexion
              </Button>
            </Stack>
          </Stack>

          {isAdmin && (
            <AdminActionBar onCreateServer={() => navigate("/gameServeur/create")} />
          )}

          {isAdmin && (
            <DiscordChannelsCard
              guilds={guilds}
              isLoading={isLoadingGuilds}
              error={guildsError}
              onSubmitSelection={onSubmitDiscordChannelSelection}
            />
          )}

          <ServersDashboard
            servers={servers}
            isLoading={isLoading}
            error={serversError}
            connected={Boolean(accessToken && profile)}
            canControl={Boolean(accessToken && profile)}
            canEdit={isAdmin}
            lastRefreshedAt={lastRefreshedAt}
            onRefresh={refresh}
            onViewServer={onViewServer}
            onEditServer={onEditServer}
            onStartServer={onStartServer}
            onStopServer={onStopServer}
            pendingServerIdentifier={pendingServerIdentifier}
          />

          {isAdmin && accessToken && <PortForwardingCard token={accessToken} />}
        </Stack>
      </Container>
    </Box>
  );
}

export default DashboardPage;
