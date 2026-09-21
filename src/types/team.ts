/**
 * Les équipes, telles que le cœur les sert.
 *
 * <p>Ce fichier recopie les DTO du domaine `team` du cœur. Deux traits comptent plus que les
 * autres, et ils viennent du plan §A.5 bis :</p>
 *
 * <ul>
 *   <li>Les projections portent des <strong>faits sur le lecteur</strong> — `viewerCanEdit`,
 *     `viewerCanEditCompositions`, `viewerMemberId` — et jamais la liste des ayants droit. Le
 *     front s'en sert tel quel : il ne compare aucun identifiant pour décider d'afficher un
 *     bouton. La comparaison qui semblait évidente répondait faux à chaque fois, parce que les
 *     identifiants comparés n'étaient pas du même monde.</li>
 *   <li>Un membre ne porte pas l'`userId` des autres. Il n'est pas absent par oubli : le servir
 *     serait distribuer les identifiants internes de comptes d'autrui pour rien.</li>
 * </ul>
 */

/** Les cinq postes de la Faille. Figés dans le code des deux côtés, comme les permissions. */
export const GAME_ROLES = ["TOP", "JGL", "MID", "ADC", "SUP"] as const;

export type GameRole = (typeof GAME_ROLES)[number];

/**
 * La place dans l'effectif — **pas** le fait d'être lié à un compte, qui est une autre question.
 *
 * <p>Elle existe parce qu'une équipe n'est pas limitée à cinq joueurs : un roster réel a des
 * remplaçants et un coach. Une *composition*, elle, en désigne exactement cinq.</p>
 */
export const MEMBER_STATUSES = ["TITULAIRE", "REMPLACANT", "COACH"] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];

/** Ce que le lecteur a le droit de faire ici. Trois faits sur lui, aucun sur les autres. */
interface ViewerFacts {
  /** Sa place dans cette équipe, ou `null` s'il n'en est pas membre. */
  viewerMemberId: string | null;
  /** Peut-il renommer l'équipe et toucher à l'effectif ? */
  viewerCanEdit: boolean;
  /** Peut-il écrire les compositions ? Distinct du précédent : les permissions le sont. */
  viewerCanEditCompositions: boolean;
}

/** Une équipe dans une liste : de quoi dessiner une carte, sans son effectif. */
export interface TeamSummaryDto extends ViewerFacts {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberDto {
  /** L'identifiant de cette **place** dans cette équipe — jamais celui d'un compte. */
  memberId: string;
  displayName: string;
  avatarUrl: string | null;
  riotGameName: string | null;
  riotTagLine: string | null;
  /** Les postes tenus, du plus habituel au moins habituel. Vide pour un coach. */
  roles: GameRole[];
  status: MemberStatus;
  /** A-t-il un compte Schub ? Un membre libre n'a que son Riot ID. */
  linked: boolean;
  /** Le créateur de l'équipe. Un fait sur l'équipe, pas la liste de ceux qui peuvent l'écrire. */
  captain: boolean;
}

export interface TeamDto extends ViewerFacts {
  id: string;
  name: string;
  memberCount: number;
  members: TeamMemberDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CompositionSlotDto {
  role: GameRole;
  /** La clé Data Dragon (`Ahri`, `MonkeyKing`…), pas un nom affiché : les noms sont traduits. */
  championId: string | null;
  memberId: string | null;
  /** Résolu à la lecture par le cœur, donc jamais périmé si le joueur change de pseudo. */
  playerDisplayName: string | null;
}

export interface CompositionDto {
  id: string;
  teamId: string;
  name: string;
  slots: CompositionSlotDto[];
  patch: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  viewerCanEdit: boolean;
}

export interface TeamNameRequest {
  name: string;
}

/**
 * Ajouter quelqu'un à l'effectif.
 *
 * <p><strong>On ajoute un Riot ID, pas un compte Schub</strong>, et il n'y a pas deux formulaires
 * : le cœur relie tout seul la place au compte dont le `puuid` correspond, s'il en existe un.
 * « Lié » et « libre » ne sont donc pas deux gestes mais deux issues du même geste — c'est ce
 * qui permet de monter une équipe avant que les cinq se soient connectés.</p>
 */
export interface AddMemberRequest {
  riotGameName: string;
  riotTagLine: string;
  /** Facultatif : fourni, il évite au cœur un appel au connecteur Riot. Le front ne l'a pas. */
  riotPuuid?: string | null;
  /** Les postes tenus, du plus habituel au moins habituel. Vide pour un coach. */
  roles: GameRole[];
  status: MemberStatus;
}

export interface UpdateMemberRequest {
  /** Les postes tenus, du plus habituel au moins habituel. Vide pour un coach. */
  roles: GameRole[];
  status: MemberStatus;
}

export interface CompositionSlotRequest {
  role: GameRole;
  championId: string;
  memberId: string | null;
}

export interface CompositionRequest {
  name: string;
  /** **Exactement cinq**, un par poste : toute autre cardinalité est refusée en 400. */
  slots: CompositionSlotRequest[];
  patch: string | null;
  notes: string | null;
}

/** Le Riot ID complet d'un membre, ou `null` s'il n'en porte pas. */
export const riotIdOf = (member: TeamMemberDto): string | null =>
  member.riotGameName && member.riotTagLine
    ? `${member.riotGameName}#${member.riotTagLine}`
    : null;

/**
 * Les membres qu'une composition peut retenir.
 *
 * <p>Le coach en est exclu : le cœur refuse de le désigner, et proposer un choix qui sera
 * refusé à l'enregistrement fait découvrir la règle par un message d'erreur.</p>
 */
export const playableMembers = (members: TeamMemberDto[]): TeamMemberDto[] =>
  members.filter((member) => member.status !== "COACH");
