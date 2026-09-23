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
  damageTakenPerMinute: number | null;
  visionPerMinute: number | null;
  /** (kills + assists) / kills de l'équipe. */
  killParticipation: number | null;
  /** Morts / morts de l'équipe. */
  deathShare: number | null;
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

export interface RadarDto {
  recentPatches: string[];
  previousPatches: string[];
  recent: StatLineDto | null;
  previous: StatLineDto | null;
}

export interface MetricBoundDto {
  low: number;
  high: number;
}

/** Bornes des axes : 5e et 95e percentiles des joueurs croisés. Une population locale. */
export interface MetricScaleDto {
  computedAt: string;
  population: number;
  minimumGames: number;
  bounds: Partial<Record<string, MetricBoundDto>>;
}

export interface TeamComparisonDto {
  comparedWith: number;
  winRateDelta: number | null;
  kdaDelta: number | null;
  csPerMinuteDelta: number | null;
  goldPerMinuteDelta: number | null;
  damagePerMinuteDelta: number | null;
  damageTakenPerMinuteDelta: number | null;
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
  radar: RadarDto | null;
  versusTeammates: TeamComparisonDto | null;
}

export interface TeamPlayersStatsDto {
  teamId: string;
  teamName: string;
  days: number | null;
  championsPerPlayer: number;
  players: PlayerStatsDto[];
  scale: MetricScaleDto | null;
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
  goldEarned: number;
  damageToChampions: number;
  damageTaken: number;
  minionsKilled: number;
  visionScore: number;
  afk: boolean;
  soloRank: RankedStandingDto | null;
  flexRank: RankedStandingDto | null;
  at15: At15Dto | null;
}

export interface At15Dto {
  gold: number;
  xp: number;
  cs: number;
  damageToChampions: number;
  kills: number;
  deaths: number;
  assists: number;
  /** Morts avant 15 min impliquant le jungler adverse ; null si les postes sont inconnus. */
  ganksSuffered: number | null;
}

/** Moyenne des joueurs classés seulement ; `value` sur l'échelle Fer IV = 0 … Challenger = 30. */
export interface AverageRankDto {
  value: number;
  tier: string;
  division: string | null;
  counted: number;
}

export interface SideRanksDto {
  solo: AverageRankDto | null;
  flex: AverageRankDto | null;
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
  allies: TeamGamePlayerDto[];
  enemies: TeamGamePlayerDto[];
  allyRanks: SideRanksDto | null;
  enemyRanks: SideRanksDto | null;
  /** Relevé des rangs, souvent après la partie : Riot ne sert que le rang courant. */
  ranksObservedAt: string | null;
}

export interface MatchupDto {
  position: string;
  ally: TeamGamePlayerDto | null;
  enemy: TeamGamePlayerDto | null;
  /** En divisions, notre joueur moins son vis-à-vis. */
  rankGap: number | null;
}

export interface TeamGameDetailDto {
  teamId: string;
  game: TeamGameDto;
  matchups: MatchupDto[];
  timelineAvailable: boolean;
  ranksObservedAt: string | null;
  viewerMemberId: string | null;
}

export interface PositionOppositionDto {
  position: string;
  games: number;
  averageGap: number | null;
  versusStronger: TeamRecordDto;
  versusWeaker: TeamRecordDto;
  laneGames: number;
  laneWinRate: number | null;
  averageGoldDiff15: number | null;
  averageCsDiff15: number | null;
}

export interface TeamOppositionDto {
  teamId: string;
  days: number | null;
  state: StatsState;
  games: number;
  gamesWithRanks: number;
  medianLagDays: number | null;
  byEnemyTier: TeamRecordDto[];
  byGap: TeamRecordDto[];
  byPosition: PositionOppositionDto[];
  ceilingTier: string | null;
  ceilingMinimumGames: number;
  generatedAt: string;
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
  radar: RadarDto | null;
  scale: MetricScaleDto | null;
  generatedAt: string;
}
