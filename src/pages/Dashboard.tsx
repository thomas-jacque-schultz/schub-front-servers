import { useEffect, useCallback, useState } from "react";
import { Chip, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getDiscordGuildChannelsApi, subscribeDiscordChannelsApi } from "../api/discordApi";
import { startGameServerApi, stopGameServerApi } from "../api/serversApi";
import AdminActionBar from "../components/AdminActionBar";
import ServersDashboard from "../components/AllServersComponent";
import PortForwardingCard from "../components/PortForwardingCard";
import { usePortForwardingStore } from "../stores/portForwardingStore";
import DiscordChannelsCard from "../components/DiscordChannelsCard";
import { useAuthStore } from "../stores/authStore";
import { useServersStore } from "../stores/serversStore";
import { Button, LanguageSwitcher, PageBackdrop, ThemeModeToggle } from "../design-system";
import { useLocalizedNavigate } from "../i18n/navigation";
import type { DiscordChannelSelection, DiscordGuildChannelsDto } from "../types/discord";

const REFRESH_INTERVAL_MS = 30_000;

function DashboardPage() {
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation("servers");
  const { accessToken, profile, isAdmin, logout } = useAuthStore();
  const {
    routerRules,
    staticRules,
    isLoading: isLoadingPortForwarding,
    error: portForwardingError,
    loadPortForwarding,
    createStaticRule,
    deleteStaticRule,
    resetPortForwarding,
  } = usePortForwardingStore();
  const { servers, isLoading, error: serversError, lastRefreshedAt, loadServers, resetServers } =
    useServersStore();
  const [guilds, setGuilds] = useState<DiscordGuildChannelsDto[]>([]);
  const [isLoadingGuilds, setIsLoadingGuilds] = useState<boolean>(false);
  const [guildsError, setGuildsError] = useState<string>("");
  const [pendingServerSlug, setPendingServerIdentifier] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (accessToken && profile) void loadServers(accessToken);
  }, [accessToken, profile, loadServers]);

  useEffect(() => {
    if (!accessToken || !profile) {
      resetServers();
      resetPortForwarding();
      setGuilds([]);
      setGuildsError("");
      return;
    }
    void loadServers(accessToken);
    // Réservé aux administrateurs, comme la carte elle-même : inutile d'interroger le back
    // pour un utilisateur qui ne verra jamais le résultat.
    if (isAdmin) {
      void loadPortForwarding(accessToken);
    }
    void (async () => {
      setIsLoadingGuilds(true);
      setGuildsError("");

      try {
        const payload = await getDiscordGuildChannelsApi(accessToken);
        setGuilds(payload);
      } catch (error) {
        setGuildsError(
          error instanceof Error ? error.message : t("channels.errors.load", { ns: "discord" }),
        );
      } finally {
        setIsLoadingGuilds(false);
      }
    })();

    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [accessToken, profile, isAdmin, loadServers, resetServers, refresh, loadPortForwarding, resetPortForwarding, t]);

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

  const onStartServer = async (serverSlug: string) => {
    if (!accessToken) {
      return;
    }

    setPendingServerIdentifier(serverSlug);
    try {
      await startGameServerApi(accessToken, serverSlug);
      await loadServers(accessToken);
    } finally {
      setPendingServerIdentifier(null);
    }
  };

  const onStopServer = async (serverSlug: string) => {
    if (!accessToken) {
      return;
    }

    setPendingServerIdentifier(serverSlug);
    try {
      await stopGameServerApi(accessToken, serverSlug);
      await loadServers(accessToken);
    } finally {
      setPendingServerIdentifier(null);
    }
  };

  return (
    <PageBackdrop variant="panel">
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
          >
            <Typography variant="h4" fontWeight={700}>
              {t("dashboard.title")}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <ThemeModeToggle />
              <LanguageSwitcher />
              <Chip
                color="primary"
                label={t("connectedAs", { ns: "auth", username: profile?.username ?? "-" })}
              />
              <Button variant="secondary" onClick={onLogout}>
                {t("logout", { ns: "auth" })}
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
            pendingServerSlug={pendingServerSlug}
          />

          {isAdmin && accessToken && (
            <PortForwardingCard
              routerRules={routerRules}
              staticRules={staticRules}
              isLoading={isLoadingPortForwarding}
              error={portForwardingError}
              onRefresh={() => loadPortForwarding(accessToken)}
              onCreate={(rule) => createStaticRule(accessToken, rule)}
              onDelete={(id) => deleteStaticRule(accessToken, id)}
            />
          )}
        </Stack>
      </Container>
    </PageBackdrop>
  );
}

export default DashboardPage;
