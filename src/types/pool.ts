/**
 * Le pool de champions, tel que le cœur le sert (`GET /teams/{id}/champion-pool`).
 *
 * <p>Le panneau ne répond plus « ce que chacun maîtrise » mais « ce qu'on peut aligner à ce
 * poste » : on choisit des champions dans le catalogue, et le cœur dit qui de l'effectif tient
 * le poste et les maîtrise assez.</p>
 *
 * <p>Comme les autres projections d'équipe, rien ici ne porte l'`userId` ni le `puuid` de
 * personne : les seuls faits sur le lecteur sont `viewerMemberId` et `viewerCanEdit`.</p>
 */

import type { GameRole, MemberStatus } from "./team";

/** Pourquoi on ne sait rien des maîtrises d'un membre — et surtout, pourquoi il reste affiché. */
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
  /** `0` est une réponse ; `null` veut dire qu'on n'a pas su lire ses maîtrises. */
  masteryPoints: number | null;
  lastPlayedAt: string | null;
  /** La date du relevé chez Riot, pas celle de la requête : le connecteur garde six heures. */
  observedAt: string | null;
}

export interface ChampionPoolEntryDto {
  championId: number;
  championKey: string;
  /** `null`, comme `iconUrl`, pour un champion retenu sous un patch qui l'avait encore. */
  name: string | null;
  iconUrl: string | null;
  players: ChampionPoolMemberDto[];
  /** Combien le plancher a écartés : sans ce compte, une liste vide se lit comme une panne. */
  setAsideByFloor: number;
}

export interface ChampionPoolColumnDto {
  role: GameRole;
  champions: ChampionPoolEntryDto[];
  /** Ceux qui tiennent ce poste et dont on ne sait pas les maîtrises. Ils ne disparaissent pas. */
  unavailableMembers: ChampionPoolMemberDto[];
  /** Choix retenus mais masqués : personne du poste ne tient le plancher. */
  hiddenByFloor: number;
}

export interface ChampionPoolDto {
  teamId: string;
  teamName: string;
  /** Sans patch, le cœur ne rend ni catalogue ni champion : une icône n'a de sens qu'avec sa version. */
  patch: string | null;
  /** Le plancher appliqué à cette réponse. */
  masteryFloor: number;
  /** Celui qu'a enregistré l'équipe : il diffère quand on a demandé un plancher pour voir. */
  teamMasteryFloor: number;
  catalog: ChampionCatalogEntryDto[];
  columns: ChampionPoolColumnDto[];
  viewerMemberId: string | null;
  viewerCanEdit: boolean;
  generatedAt: string;
}
