/**
 * Le profil de l'appelant, tel que le cœur le sert sous `/users/me`.
 *
 * <p>À ne pas confondre avec `AuthMeResponse` (`/auth/me`), qui lit le **jeton** et dit ce que le
 * BFF appliquera. Le jeton ne porte ni avatar, ni nom choisi, ni état de liaison Riot : ces
 * choses vivent dans le cœur et ne peuvent venir que de lui.</p>
 */

/**
 * Où en est la liaison au compte Riot. **Trois états, pas un booléen** : le `puuid` est la seule
 * clé stable côté Riot, mais le résoudre demande le connecteur, qui peut être éteint. Un Riot ID
 * déclaré sans `puuid` n'est donc ni lié, ni absent — et l'écran doit pouvoir le dire.
 */
export const RIOT_ACCOUNT_STATES = ["ABSENT", "EN_ATTENTE_DE_RESOLUTION", "RESOLU"] as const;

export type RiotAccountState = (typeof RIOT_ACCOUNT_STATES)[number];

/**
 * L'avancement de la collecte des parties.
 *
 * <p>`null` quand le connecteur Riot est injoignable — ce n'est pas « zéro en attente », c'est
 * « on ne sait pas », et les deux ne s'affichent pas pareil.</p>
 *
 * <p>`estimatedReadyAt` est le seul chiffre qui réponde à la question posée : « 4 300 en
 * attente » ne dit rien, « prêt vers 15 h 20 » si.</p>
 */
export interface RiotIngestDto {
  pending: number;
  running: number;
  estimatedReadyAt: string | null;
}

export interface ProfileRiotDto {
  state: RiotAccountState;
  /** `Pseudo#TAG` reconstitué, ou `null` si rien n'est déclaré. */
  riotId: string | null;
  gameName: string | null;
  tagLine: string | null;
  linkedAt: string | null;
  ingest: RiotIngestDto | null;
}

/** L'identité Discord : en lecture seule, elle vient de Discord et de nulle part ailleurs. */
export interface ProfileDiscordDto {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface ProfileRoleDto {
  name: string;
  permissions: string[];
}

export interface ProfileDto {
  userId: string;
  discord: ProfileDiscordDto;
  displayName: string;
  role: ProfileRoleDto;
  riot: ProfileRiotDto;
}

export interface DisplayNameRequest {
  displayName: string;
}

export interface RiotAccountRequest {
  /** `Pseudo#TAG`, d'un bloc — c'est sous cette forme que le client de jeu l'affiche. */
  riotId: string;
  /**
   * Assume le remplacement d'un *autre* compte déjà lié.
   *
   * <p>Faux, le cœur refuse en 409 **et rend les conséquences** au lieu de les appliquer. C'est ce
   * qui rend un changement subi impossible : on ne peut confirmer que ce qu'on a lu.</p>
   */
  confirmChange: boolean;
}

/**
 * Les postes tels que les parties ingérées les portent.
 *
 * <p>Ce n'est **pas** `GameRole` (`TOP`/`JGL`/`MID`/`ADC`/`SUP`), qui est le vocabulaire d'un
 * effectif d'équipe. Ici on décrit ce que Riot a constaté dans des parties jouées, et son
 * vocabulaire est différent. Les rapprocher de force ferait passer une observation pour une
 * décision d'équipe.</p>
 */
export const RIOT_POSITIONS = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY", "UNKNOWN"] as const;

export type RiotPosition = (typeof RIOT_POSITIONS)[number];

/**
 * Un compte Riot déjà croisé dans nos parties.
 *
 * <p>Les suggestions viennent de **nos** données et jamais de Riot : leur API n'offre aucune
 * recherche par pseudo partiel. Chaque champ ici sert à une seule chose — permettre à quelqu'un
 * de reconnaître son compte parmi des homonymes.</p>
 */
export interface PositionPlayedDto {
  /** Le vocabulaire de Riot, servi en chaîne. Un poste inconnu s’affiche brut plutôt que masqué. */
  position: string;
  /** Le nombre de parties où on l'y a vu — un poste tenu deux fois ne vaut pas un poste habituel. */
  matches: number;
}

export interface KnownRiotAccountDto {
  riotId: string;
  /** Le pseudo tel qu'il était lors de la partie la plus récente connue. Il a pu changer depuis. */
  gameName: string;
  tagLine: string;
  /** Le nombre de parties où **nous** avons croisé ce compte, pas sa carrière. */
  matchCount: number;
  /** Ses postes, du plus joué au moins joué. */
  positions: PositionPlayedDto[];
  lastPlayedAt: string | null;
  /**
   * Quand cette identité a été observée — la partie où on l'a croisé, ou l'appel qui l'a fait
   * confirmer par Riot. Un Riot ID change de main : c'est cette date qui dit s'il faut le
   * revérifier avant de s'y fier.
   */
  observedAt: string;
  /**
   * `PARTICIPATION` ou `RESOLUTION`, servi en chaîne. Le connecteur peut en ajouter une sans que
   * cet écran cesse de fonctionner — une source inconnue s'affiche sans étiquette plutôt que de
   * rendre une clé de traduction manquante.
   */
  source: string;
  /**
   * Ce compte est déjà revendiqué par quelqu’un. Un fait sur la proposition, pas la liste de
   * ceux qui l’ont pris : le proposer sans le dire mènerait à un 409 qu’on pouvait éviter.
   */
  alreadyLinked: boolean;
  /** C’est le compte de l’appelant. Un fait sur le lecteur — il se reconnaît sans comparer. */
  mine: boolean;
}

/**
 * Ce que le remplacement d'un compte emporte, **tel que le cœur le calcule**.
 *
 * <p>Il n'existe pas de route de prévisualisation, et c'est mieux ainsi : un `PUT` sans
 * `confirmChange` répond **409 et porte cet objet dans son corps**. Le refus est donc
 * l'information, au lieu d'être une fin de non-recevoir suivie d'un second appel — et il devient
 * impossible de confirmer un changement dont on n'a pas reçu les conséquences.</p>
 *
 * <p>Chaque champ est un fait, jamais une phrase : le site est bilingue, une phrase servie par le
 * serveur n'existerait que dans une langue. L'écran met en forme ce qu'il reçoit, et n'affiche
 * rien pour ce qu'il ne reçoit pas.</p>
 */
export interface RiotAccountChangeDto {
  previousRiotId: string | null;
  riotId: string;
  /** Les statistiques personnelles repartent de zéro. */
  statsReset: boolean;
  /** Une nouvelle collecte démarre. */
  ingestRestarted: boolean;
  /** Le volume estimé de cette collecte. */
  estimatedMatches: number;
  /**
   * La durée estimée de la collecte.
   *
   * <p>Jackson sérialise une `Duration` en ISO-8601 ou en secondes décimales selon
   * `WRITE_DURATIONS_AS_TIMESTAMPS`, que rien ne fixe explicitement côté cœur. Les deux formes
   * sont donc lues : afficher « 1 200 minutes » pour vingt minutes serait un chiffre faux, et un
   * chiffre faux se lit comme vrai.</p>
   */
  estimatedDuration: string | number | null;
  /** Des places d'effectif attendent d'être revendiquées après le changement. */
  rosterSlotsToClaim: boolean;
}
