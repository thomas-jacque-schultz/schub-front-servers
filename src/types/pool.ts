/**
 * Le pool de champions, tel que le cœur le sert (`GET /teams/{id}/champion-pool`).
 *
 * <p>Comme les projections d'équipe, rien ici ne porte l'`userId` ni le `puuid` de personne : le
 * seul fait sur le lecteur est `viewerMemberId`.</p>
 */

import type { MemberStatus } from "./team";
import type { GameRole } from "./team";

/** Pourquoi la colonne d'un membre contient ce qu'elle contient — et surtout pourquoi elle est vide. */
export type PoolState =
  | "MAITRISES_CONNUES"
  | "COMPTE_RIOT_ABSENT"
  | "MAITRISES_INDISPONIBLES"
  | "CATALOGUE_INDISPONIBLE"
  | "AUCUNE_MAITRISE";

export interface ChampionPoolEntryDto {
  championId: number;
  /** `null`, comme `name` et `iconUrl`, pour un champion absent du catalogue de ce patch. */
  championKey: string | null;
  name: string | null;
  iconUrl: string | null;
  masteryLevel: number;
  masteryPoints: number;
  lastPlayedAt: string | null;
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
  champions: ChampionPoolEntryDto[];
  /** La date du relevé chez Riot, pas celle de la requête : le connecteur garde six heures. */
  observedAt: string | null;
}

export interface ChampionPoolColumnDto {
  role: GameRole;
  members: ChampionPoolMemberDto[];
}

export interface ChampionPoolDto {
  teamId: string;
  teamName: string;
  /** Sans patch, le cœur ne rend aucun champion — une icône n'a de sens que rapportée à sa version. */
  patch: string | null;
  championsPerMember: number;
  columns: ChampionPoolColumnDto[];
  membersWithoutRole: ChampionPoolMemberDto[];
  viewerMemberId: string | null;
  generatedAt: string;
}
