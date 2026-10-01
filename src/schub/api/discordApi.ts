import { requestJson } from "../../common";
import type {
  ChannelCleanupDto,
  DiscordChannelSelection,
  DiscordGuildChannelsDto,
} from "../types/discord";

export const getDiscordGuildChannelsApi = async (): Promise<
  DiscordGuildChannelsDto[]
> =>
  requestJson<DiscordGuildChannelsDto[]>("/discord/guilds/channels", {
    method: "GET",
  });

export const subscribeDiscordChannelsApi = async (
  channels: DiscordChannelSelection[],
): Promise<void> => {
  await requestJson<void>("/discord/channels/subscribe", {
    method: "POST",
    body: JSON.stringify({ channels }),
  });
};

export const previewChannelCleanupApi = async (): Promise<
  ChannelCleanupDto[]
> =>
  requestJson<ChannelCleanupDto[]>("/discord/channels/clean", {
    method: "GET",
  });

export const cleanChannelsApi = async (): Promise<ChannelCleanupDto[]> =>
  requestJson<ChannelCleanupDto[]>("/discord/channels/clean", {
    method: "POST",
  });
