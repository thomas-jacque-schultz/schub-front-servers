import type { Schemas } from "../../common";

export type StatsState =
  | "STATISTIQUES_CONNUES"
  | "COMPTE_RIOT_ABSENT"
  | "INGESTION_EN_COURS"
  | "AUCUNE_PARTIE"
  | "EFFECTIF_INCOMPLET"
  | "CONNECTEUR_INDISPONIBLE";

export type StatsCoverageDto = Schemas["StatsCoverageDto"];

export type StatComparisonDto = Schemas["StatComparisonDto"];

export type StatLineDto = Schemas["StatLineDto"];

export type RankedStandingDto = Schemas["RankedStandingDto"];

export type MetricBoundDto = Schemas["Bound"];

/** 5e et 95e percentiles des moyennes par joueur d'une population, au même poste. */
export type MetricReferenceDto = Schemas["MetricReferenceDto"];

/** Poste le plus joué et palier du joueur (pour lire sa grille) ; `met` : ses adversaires directs. */
export type RadarReferencesDto = Schemas["RadarReferencesDto"];

export type PlayerStatsDto = Schemas["PlayerStatsDto"];

export type TeamPlayersStatsDto = Schemas["TeamPlayersStatsDto"];

export type TeamRecordDto = Schemas["TeamRecordDto"];

export type TeamGamePlayerDto = Schemas["TeamGamePlayerDto"];

export type At15Dto = Schemas["At15Dto"];

/** Moyenne des joueurs classés seulement ; `value` sur l'échelle Fer IV = 0 … Challenger = 30. */
export type AverageRankDto = Schemas["AverageRankDto"];

export type SideRanksDto = Schemas["SideRanksDto"];

export type TeamGameDto = Schemas["TeamGameDto"];

export type MatchupDto = Schemas["MatchupDto"];

export type TeamGameDetailDto = Schemas["TeamGameDetailDto"];

/** Un joueur d'une partie, désigné par son camp et son champion. */
export type GamePlayerMetricsDto = Schemas["GamePlayerMetricsDto"];

export type MyGamesDto = Schemas["MyGamesDto"];

export type Lane = "TOP" | "MID" | "BOT";
export type StrongSide = "TOP" | "BOT" | "BALANCED";

/** Issue vue de l'attaquant : KILL, le couloir visé a perdu quelqu'un sans perte en face. */
export type GankOutcome = "KILL" | "TRADE" | "SURVIVED" | "COUNTER";

export type GankDto = Schemas["GankDto"];

export type JunglePresenceDto = Schemas["JunglePresenceDto"];

export type ObjectivesDto = Schemas["ObjectivesDto"];

export type EarlyGameDto = Schemas["EarlyGameDto"];

export type SupportLineDto = Schemas["SupportLineDto"];

export type JunglerLineDto = Schemas["JunglerLineDto"];

export type MemberEarlyDto = Schemas["MemberEarlyDto"];

export type PresenceWithDto = Schemas["PresenceWithDto"];

export type StrongSideRecordDto = Schemas["StrongSideDto"];

export type TeamEarlyGameDto = Schemas["TeamEarlyGameDto"];

export type PositionOppositionDto = Schemas["PositionOppositionDto"];

export type TeamOppositionDto = Schemas["TeamOppositionDto"];

export type TeamMemberPresenceDto = Schemas["TeamMemberPresenceDto"];

export type TeamGamesStatsDto = Schemas["TeamGamesStatsDto"];

export type RiotIngestProgressDto = Schemas["RiotIngestProgressDto"];

export type MyStatsDto = Schemas["MyStatsDto"];

/** nextAllowedAt : null quand une mise à jour peut être demandée tout de suite. */
export type StatsRefreshDto = Schemas["StatsRefreshDto"];

export type ReferenceScope = "GAME" | "MEAN";

/** Répartition d'une métrique : une grille de quantiles par palier. */
export type ReferenceGridDto = Schemas["ReferenceGridDto"];

export type ReferenceMetricDto = Schemas["ReferenceGridMetric"];

/** Moyennes des joueurs d'un champion dans un groupe de paliers. Métrique absente : pas assez de joueurs. */
export type ChampionGridDto = Schemas["ChampionGridDto"];

export type TeamLevelDto = Schemas["TeamLevelDto"];

export type TeamLevelMetricDto = Schemas["TeamLevelMetric"];

export type DuoDto = Schemas["Duo"];

export type ResourceDto = Schemas["Resource"];

export type ClosenessDto = Schemas["Closeness"];

export type RolesDto = Schemas["Roles"];
export type HolderDto = Schemas["Holder"];

export type TeamSynergyDto = Schemas["TeamSynergyDto"];
