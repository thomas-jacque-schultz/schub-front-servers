import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDiscordGuildChannelsApi, subscribeDiscordChannelsApi } from "../../api/discordApi";
import DiscordChannelsCard from "../../components/DiscordChannelsCard";
import { PageHeader, Stack } from "../../design-system";
import { useAuthStore } from "../../stores/authStore";
import type { DiscordChannelSelection, DiscordGuildChannelsDto } from "../../types/discord";

/** Les salons qui reçoivent les changements d'état. Réservé à `DISCORD_CHANNEL_MANAGE`. */
function DiscordConfigPage() {
  const { t } = useTranslation("servers");
  const { accessToken } = useAuthStore();
  const [guilds, setGuilds] = useState<DiscordGuildChannelsDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      setGuilds(await getDiscordGuildChannelsApi(accessToken));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t("channels.errors.load", { ns: "discord" }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("config.eyebrow")}
        title={t("config.discordTitle")}
        subtitle={t("config.discordSubtitle")}
      />
      <DiscordChannelsCard
        guilds={guilds}
        isLoading={isLoading}
        error={error}
        onSubmitSelection={async (selection: DiscordChannelSelection[]) => {
          await subscribeDiscordChannelsApi(accessToken, selection);
          await load();
        }}
      />
    </Stack>
  );
}

export default DiscordConfigPage;
