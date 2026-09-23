import type { GameRole, MemberStatus } from "./team";

export type StatsState =
  | "STATISTIQUES_CONNUES"
  | "COMPTE_RIOT_ABSENT"
  | "INGESTION_EN_COURS"
  | "AUCUNE_PARTIE"
  | "EFFECTIF_INCOMPLET"
  | "CONNECTEUR_INDISPONIBLE";

export interface StatsCoverageDto {
  games: number;
  knownMatches: number;
  pendingMatches: number;
  tracked: boolean;
  firstPlayedAt: string | null;
  lastPlayedAt: string | null;
  lastSyncAt: string | null;
}

export interface StatComparisonDto {
  referenceGames: number;
  winRateDelta: number | null;
  kdaDelta: number | null;
}

export interface StatLineDto {
  key: string;
  label: string | null;
  iconUrl: string | null;
  games: number;
  wins: number;
  winRate: number | null;
  kda: number | null;
  killsPerGame: number | null;
  deathsPerGame: number | null;
  assistsPerGame: number | null;
  csPerMinute: number | null;
  goldPerMinute: number | null;
  damagePerMinute: number | null;
  visionPerMinute: number | null;
  afkGames: number;
  secondsPlayed: number;
  firstPlayedAt: string | null;
  lastPlayedAt: string | null;
  versusRest: StatComparisonDto | null;
}

export interface RankedStandingDto {
  queue: string | null;
  riotQueueType: string | null;
  tier: string | null;
  division: string | null;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  inactive: boolean;
  observedAt: string | null;
}

export interface TeamComparisonDto {
  comparedWith: number;
  winRateDelta: number | null;
  kdaDelta: number | null;
  goldPerMinuteDelta: number | null;
  damagePerMinuteDelta: number | null;
  visionPerMinuteDelta: number | null;
}

export interface PlayerStatsDto {
  memberId: string;
  displayName: string | null;
  avatarUrl: string | null;
  riotGameName: string | null;
  riotTagLine: string | null;
  status: MemberStatus;
  roles: GameRole[];
  linked: boolean;
  state: StatsState;
  coverage: StatsCoverageDto | null;
  overall: StatLineDto | null;
  champions: StatLineDto[];
  positions: StatLineDto[];
  queues: StatLineDto[];
  months: StatLineDto[];
  rankings: RankedStandingDto[];
  versusTeammates: TeamComparisonDto | null;
}

export interface TeamPlayersStatsDto {
  teamId: string;
  teamName: string;
  days: number | null;
  championsPerPlayer: number;
  players: PlayerStatsDto[];
  viewerMemberId: string | null;
  generatedAt: string;
}

export interface TeamRecordDto {
  key: string;
  label: string | null;
  games: number;
  wins: number;
  losses: number;
  winRate: number | null;
  averageDurationSeconds: number | null;
}

export interface TeamGamePlayerDto {
  memberId: string | null;
  displayName: string | null;
  championId: number;
  championName: string | null;
  iconUrl: string | null;
  position: string | null;
  side: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  afk: boolean;
}

export interface TeamGameDto {
  matchId: string;
  startedAt: string | null;
  durationSeconds: number;
  queueId: number;
  queue: string | null;
  patch: string | null;
  presentPlayers: number;
  splitSides: boolean;
  win: boolean | null;
  players: TeamGamePlayerDto[];
}

export interface TeamMemberPresenceDto {
  memberId: string;
  displayName: string | null;
  status: MemberStatus;
  games: number;
  wins: number;
  winRate: number | null;
  presenceRate: number | null;
  state: StatsState;
}

export interface TeamGamesStatsDto {
  teamId: string;
  teamName: string;
  days: number | null;
  minimumPlayers: number;
  rosterSize: number;
  state: StatsState;
  overall: TeamRecordDto;
  byQueue: TeamRecordDto[];
  bySide: TeamRecordDto[];
  byPatch: TeamRecordDto[];
  presence: TeamMemberPresenceDto[];
  games: TeamGameDto[];
  totalGames: number;
  undecidedGames: number;
  truncated: boolean;
  firstPlayedAt: string | null;
  lastPlayedAt: string | null;
  viewerMemberId: string | null;
  generatedAt: string;
}

export interface RiotIngestProgressDto {
  pending: number;
  running: number;
  estimatedReadyAt: string | null;
}

export interface MyStatsDto {
  displayName: string | null;
  riotGameName: string | null;
  riotTagLine: string | null;
  days: number | null;
  state: StatsState;
  coverage: StatsCoverageDto | null;
  ingest: RiotIngestProgressDto | null;
  overall: StatLineDto | null;
  champions: StatLineDto[];
  positions: StatLineDto[];
  queues: StatLineDto[];
  months: StatLineDto[];
  rankings: RankedStandingDto[];
  generatedAt: string;
}
