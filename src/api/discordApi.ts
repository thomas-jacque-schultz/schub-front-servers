import { requestJson } from "./httpClient";
import type {
  DiscordChannelSelection,
  DiscordGuildChannelsDto,
} from "../types/discord";

export const getDiscordGuildChannelsApi = async (): Promise<DiscordGuildChannelsDto[]> =>
  requestJson<DiscordGuildChannelsDto[]>("/discord/guilds/channels", { method: "GET" });

export const subscribeDiscordChannelsApi = async (
  channels: DiscordChannelSelection[],
): Promise<void> => {
  await requestJson<void>("/discord/channels/subscribe", {
    method: "POST",
    body: JSON.stringify({ channels }),
  });
};
