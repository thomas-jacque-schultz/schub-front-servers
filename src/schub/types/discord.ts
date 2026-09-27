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
