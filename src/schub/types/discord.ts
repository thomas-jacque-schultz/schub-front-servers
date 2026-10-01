export interface DiscordChannelDto {
  id: string;
  name: string;
  subscribed: boolean;
}

export interface DiscordGuildChannelsDto {
  guildId: string;
  guildName: string;
  channels: DiscordChannelDto[];
}

export interface DiscordChannelSelection {
  guildId: string;
  channelId: string;
  channelName: string;
}

export interface ChannelCleanupDto {
  channelId: string;
  name: string;
  /** Faux sans la permission « Gérer les messages » : le salon est laissé tel quel. */
  allowed: boolean;
  toDelete: number;
  toRepost: number;
}
