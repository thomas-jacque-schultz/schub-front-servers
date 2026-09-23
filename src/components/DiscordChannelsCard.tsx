import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Chip,
  Disclosure,
  Divider,
  Spinner,
  Stack,
  Text,
} from "../design-system";
import type { DiscordChannelSelection, DiscordGuildChannelsDto } from "../types/discord";

interface DiscordChannelsCardProps {
  guilds: DiscordGuildChannelsDto[];
  isLoading: boolean;
  error: string;
  onSubmitSelection: (selection: DiscordChannelSelection[]) => Promise<void>;
}

const channelKey = (guildId: string, channelId: string) => `${guildId}:${channelId}`;

function DiscordChannelsCard({
  guilds,
  isLoading,
  error,
  onSubmitSelection,
}: DiscordChannelsCardProps) {
  const { t } = useTranslation("discord");
  const [selected, setSelected] = useState<Record<string, DiscordChannelSelection>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [channelsExpanded, setChannelsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const next: Record<string, DiscordChannelSelection> = {};

    guilds.forEach((guild) => {
      guild.channels
        .filter((channel) => channel.subscribed)
        .forEach((channel) => {
          const key = channelKey(guild.guildId, channel.id);
          next[key] = {
            guildId: guild.guildId,
            channelId: channel.id,
            channelName: channel.name,
          };
        });
    });

    setSelected(next);
  }, [guilds]);

  const effectiveSelection = useMemo(() => Object.values(selected), [selected]);

  const onToggleChannel = (
    guildId: string,
    channelId: string,
    channelName: string,
    checked: boolean,
  ) => {
    const key = channelKey(guildId, channelId);
    setSubmitError("");
    setSuccessMessage("");

    setSelected((previous) => {
      if (checked) {
        return {
          ...previous,
          [key]: { guildId, channelId, channelName },
        };
      }

      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const isChecked = (guildId: string, channelId: string): boolean =>
    Boolean(selected[channelKey(guildId, channelId)]);

  const onSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      await onSubmitSelection(effectiveSelection);
      setSuccessMessage(t("channels.success"));
    } catch (submitException) {
      setSubmitError(
        submitException instanceof Error ? submitException.message : t("channels.errors.save"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      title={t("channels.title")}
      description={t("channels.description")}
      actions={
        <Chip
          tone="primary"
          label={t("channels.selectionCount", { count: effectiveSelection.length })}
        />
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {submitError && <Alert severity="error">{submitError}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Disclosure
          title={t("channels.accordion", { count: guilds.length })}
          open={channelsExpanded}
          onToggle={setChannelsExpanded}
        >
          {isLoading ? (
            <Stack align="center">
              <Spinner label={t("channels.title")} />
            </Stack>
          ) : (
            <Stack spacing={2}>
              {guilds.map((guild) => (
                <Stack key={guild.guildId} spacing={1}>
                  <Text variant="subtitle">{guild.guildName}</Text>
                  <Stack spacing={0}>
                    {guild.channels.map((channel) => (
                      <Checkbox
                        key={channel.id}
                        checked={isChecked(guild.guildId, channel.id)}
                        onChange={(checked) =>
                          onToggleChannel(guild.guildId, channel.id, channel.name, checked)
                        }
                        label={`#${channel.name}`}
                      />
                    ))}
                  </Stack>
                  <Divider />
                </Stack>
              ))}
            </Stack>
          )}
        </Disclosure>

        <Stack direction="row" justify="end">
          <Button
            onClick={() => void onSubmit()}
            loading={isSubmitting}
            disabled={isLoading || effectiveSelection.length === 0}
          >
            {t("channels.submit")}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

export default DiscordChannelsCard;
