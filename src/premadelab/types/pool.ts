import type { GameRole, MemberStatus } from "./team";

export type PoolState =
  | "MAITRISES_CONNUES"
  | "COMPTE_RIOT_ABSENT"
  | "MAITRISES_INDISPONIBLES"
  | "CATALOGUE_INDISPONIBLE"
  | "AUCUNE_MAITRISE";

export interface ChampionCatalogEntryDto {
  championId: number;
  championKey: string;
  name: string;
  iconUrl: string;
}

export interface ChampionPoolMemberDto {
  memberId: string;
  displayName: string | null;
  avatarUrl: string | null;
  riotGameName: string | null;
  riotTagLine: string | null;
  status: MemberStatus;
  linked: boolean;
  state: PoolState;
  masteryLevel: number | null;
  masteryPoints: number | null;
  /** Parties sur la Faille avec ce champion ; null si le connecteur n'a pas répondu. */
  games: number | null;
  winRate: number | null;
  lastPlayedAt: string | null;
  observedAt: string | null;
}

export interface ChampionPoolEntryDto {
  championId: number;
  championKey: string;
  name: string | null;
  iconUrl: string | null;
  players: ChampionPoolMemberDto[];
  setAsideByFloor: number;
}

export interface ChampionPoolColumnDto {
  role: GameRole;
  champions: ChampionPoolEntryDto[];
  unavailableMembers: ChampionPoolMemberDto[];
  hiddenByFloor: number;
}

export interface ChampionPoolDto {
  teamId: string;
  teamName: string;
  patch: string | null;
  masteryFloor: number;
  teamMasteryFloor: number;
  catalog: ChampionCatalogEntryDto[];
  columns: ChampionPoolColumnDto[];
  viewerMemberId: string | null;
  viewerCanEdit: boolean;
  generatedAt: string;
}
