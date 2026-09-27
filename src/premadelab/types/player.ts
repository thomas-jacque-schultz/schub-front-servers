import type { MyStatsDto, RankedStandingDto } from "./stats";

export interface MasteryDto {
  championId: number;
  championName: string | null;
  iconUrl: string | null;
  level: number;
  points: number;
}

/** La page publique d'un joueur recherché : profil tout de suite, statistiques dès que ses parties arrivent. */
export interface SearchedPlayerDto {
  gameName: string;
  tagLine: string;
  slug: string;
  /** Son historique a déjà été relevé : rien à collecter. */
  known: boolean;
  knownGames: number;
  rankings: RankedStandingDto[];
  masteries: MasteryDto[];
  stats: MyStatsDto;
}

export type CollectLane = "KNOWN" | "FAST" | "SLOW";

export interface PlayerSuggestionDto {
  riotId: string;
  gameName: string;
  tagLine: string;
  matchCount: number;
  positions: string[];
  lastPlayedAt: string | null;
}
