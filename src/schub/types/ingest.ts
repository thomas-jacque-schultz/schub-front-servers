export interface IngestLoadDto {
  available: boolean;
  pending: number;
  running: number;
  failed: number;
  callsPerMinute: number;
  /** Durée ISO-8601 (PT1H25M). */
  estimatedDrain: string | null;
  estimatedReadyAt: string | null;
  throttledFor: string | null;
}

export interface CrawlerDto {
  available: boolean;
  /** Faux en prod : la collecte de fond y tourne toujours. */
  switchable: boolean;
  enabled: boolean;
  running: boolean;
  knownAccounts: number;
  trackedAccounts: number;
  backgroundPending: number;
  databaseBytes: number;
  storageAlertBytes: number;
  storageAlert: boolean;
  lastRoundAt: string | null;
  lastRoundAccounts: number;
}

export interface IngestCountsDto {
  retrieved: number;
  analysed: number;
  pending: number;
}

export interface IngestSummaryDto {
  available: boolean;
  matches: IngestCountsDto;
  profiles: IngestCountsDto;
}

export interface IngestPauseDto {
  available: boolean;
  paused: boolean;
  updatedAt: string | null;
  /** Tâches prises avant la pause et pas encore terminées. */
  running: number;
}

export interface RiotDataInventoryDto {
  available: boolean;
  riotDocuments: number;
  findings: number;
  linkedAccounts: number;
  teamSlots: number;
  teams: number;
}

export interface RiotDataInvalidationDto {
  riotDocuments: number;
  findings: number;
  accountsToResolve: number;
}

export interface AccountsByRankRowDto {
  /** UNRANKED, puis IRON … CHALLENGER. */
  tier: string;
  tracked: number;
  seeds: number;
}

export interface AccountsByRankDto {
  available: boolean;
  rows: AccountsByRankRowDto[];
}
