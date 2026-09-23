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
