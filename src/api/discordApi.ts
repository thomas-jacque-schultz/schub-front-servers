import { requestJson } from "./httpClient";
import type {
  DiscordChannelSelection,
  DiscordGuildChannelsDto,
} from "../types/discord";

/**
 * Ce qui est réellement Discord. Depuis la phase 3, le connecteur ne détient plus aucun
 * domaine : il ne sait parler que de guildes, de salons et de messages.
 */
export const getDiscordGuildChannelsApi = async (
  token: string,
): Promise<DiscordGuildChannelsDto[]> => {
  return requestJson<DiscordGuildChannelsDto[]>("/discord/guilds/channels", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Choisit les salons qui reçoivent les notifications de serveurs.
 *
 * Cette route vivait sur `/gaming-server/subscribe-channels` et a disparu avec le contrôleur du
 * domaine à la phase 3 : depuis, ce bouton tombait en 404. Elle est rétablie en phase 4 sous
 * `/discord`, où elle appartient — choisir un salon est une affaire de Discord, pas de serveur
 * de jeu.
 */
export const subscribeDiscordChannelsApi = async (
  token: string,
  channels: DiscordChannelSelection[],
): Promise<void> => {
  await requestJson<void>("/discord/channels/subscribe", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channels }),
  });
};
