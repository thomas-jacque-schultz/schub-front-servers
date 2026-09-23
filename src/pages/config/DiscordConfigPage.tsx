import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDiscordGuildChannelsApi, subscribeDiscordChannelsApi } from "../../api/discordApi";
import DiscordChannelsCard from "../../components/DiscordChannelsCard";
import { PageHeader, Stack } from "../../design-system";
import type { DiscordChannelSelection, DiscordGuildChannelsDto } from "../../types/discord";

function DiscordConfigPage() {
  const { t } = useTranslation("servers");
  const [guilds, setGuilds] = useState<DiscordGuildChannelsDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setGuilds(await getDiscordGuildChannelsApi());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t("channels.errors.load", { ns: "discord" }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

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
          await subscribeDiscordChannelsApi(selection);
          await load();
        }}
      />
    </Stack>
  );
}

export default DiscordConfigPage;
