export const RIOT_ACCOUNT_STATES = ["ABSENT", "EN_ATTENTE_DE_RESOLUTION", "RESOLU"] as const;

export type RiotAccountState = (typeof RIOT_ACCOUNT_STATES)[number];

export interface RiotIngestDto {
  pending: number;
  running: number;
  estimatedReadyAt: string | null;
}

export interface ProfileRiotDto {
  state: RiotAccountState;
  riotId: string | null;
  gameName: string | null;
  tagLine: string | null;
  linkedAt: string | null;
  ingest: RiotIngestDto | null;
}

export interface ProfileDiscordDto {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface ProfileRoleDto {
  name: string;
  permissions: string[];
}

export interface ProfileDto {
  userId: string;
  discord: ProfileDiscordDto;
  displayName: string;
  displayNameChosen: boolean;
  role: ProfileRoleDto;
  riot: ProfileRiotDto;
}

export interface DisplayNameRequest {
  displayName: string;
}

export interface RiotAccountRequest {
  riotId: string;
  confirmChange: boolean;
}

// Vocabulaire des parties Riot, distinct de GameRole (effectif d'équipe).
export const RIOT_POSITIONS = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY", "UNKNOWN"] as const;

export type RiotPosition = (typeof RIOT_POSITIONS)[number];

export interface PositionPlayedDto {
  position: string;
  matches: number;
}

export interface KnownRiotAccountDto {
  riotId: string;
  gameName: string;
  tagLine: string;
  matchCount: number;
  positions: PositionPlayedDto[];
  lastPlayedAt: string | null;
  observedAt: string;
  source: string;
  alreadyLinked: boolean;
  mine: boolean;
}

export interface RiotAccountChangeDto {
  previousRiotId: string | null;
  riotId: string;
  statsReset: boolean;
  ingestRestarted: boolean;
  estimatedMatches: number;
  estimatedDuration: string | number | null;
  rosterSlotsToClaim: boolean;
}
