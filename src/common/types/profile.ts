import type { Schemas } from "..";

export const RIOT_ACCOUNT_STATES = [
  "ABSENT",
  "EN_ATTENTE_DE_RESOLUTION",
  "RESOLU",
] as const;

export type RiotAccountState = (typeof RIOT_ACCOUNT_STATES)[number];

export type RiotIngestDto = Schemas["RiotIngestDto"];

export type ProfileRiotDto = Schemas["RiotAccountDto"];

export type ProfileDiscordDto = Schemas["DiscordIdentityDto"];

export type ProfileRoleDto = Schemas["RoleSummaryDto"];

export type ProfileDto = Schemas["MeDto"];

export type DisplayNameRequest = Schemas["DisplayNameRequest"];

export type RiotAccountRequest = Schemas["RiotAccountRequest"];

// Vocabulaire des parties Riot, distinct de GameRole (effectif d'équipe).
export const RIOT_POSITIONS = [
  "TOP",
  "JUNGLE",
  "MIDDLE",
  "BOTTOM",
  "UTILITY",
  "UNKNOWN",
] as const;

export type RiotPosition = (typeof RIOT_POSITIONS)[number];

export type PositionPlayedDto = Schemas["PositionPlayedDto"];

export type KnownRiotAccountDto = Schemas["RiotAccountSuggestionDto"];

export type RiotAccountChangeDto = Schemas["RiotAccountChangeDto"];
