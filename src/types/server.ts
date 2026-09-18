export type ServerStatus = "online" | "offline" | "unknown" | "unreachable";

export type GameServerFormMode = "creation" | "edition" | "visualisation";

export interface DisplayedServer {
  id?: string;
  /** Identifiant humain stable. Anciennement `identifier` (§2 du plan). */
  slug?: string;
  name: string;
  status: ServerStatus;
  lastStatusCheckAt?: string; // ISO-8601, null = never checked
}

export interface GameServerPortDto {
  /** "tcp" ou "udp" */
  proto: string;
  /** port ouvert sur la Freebox */
  wanPort: number;
  /** port visé sur le LAN ; absent = identique à wanPort */
  lanPort?: number;
  /** IP LAN visée ; absent = valeur par défaut du back */
  lanIp?: string;
}

/**
 * Un administrateur de serveur, résolu par le cœur pour l'affichage.
 *
 * <p>Depuis le 18-09 la liste `admins` porte des **identifiants internes de comptes**, plus des
 * pseudos libres (§A.4). Le cœur résout le pseudo et l'avatar en une fois, côté serveur : le
 * front affiche qui c'est sans faire N appels.</p>
 *
 * <p>`discordUsername` et `avatarUrl` peuvent être nuls — c'est un identifiant qui ne désigne
 * plus personne, et le cœur le renvoie exprès plutôt que de l'omettre, pour qu'il se voie.</p>
 */
export interface ServerAdminDto {
  userId: string;
  discordUsername?: string | null;
  avatarUrl?: string | null;
}

/**
 * Un serveur tel que le cœur l'expose.
 *
 * <p><strong>Trois projections, une seule forme ici.</strong> Depuis le lot A.1, le cœur choisit
 * ce qu'il envoie selon les permissions de l'acteur :</p>
 * <ul>
 *   <li>sans compte — `PublicServerStatusDto` : nom, jeu, statut ;</li>
 *   <li>avec `SERVER_VIEW` — la projection « membre » : de quoi rejoindre et suivre ;</li>
 *   <li>avec `SERVER_INFRA_VIEW` — en plus : `deploymentId`, `ports`, `admins`.</li>
 * </ul>
 *
 * <p>Les trois champs d'infrastructure sont donc **normalement absents** pour un membre. Ce
 * n'est pas une erreur de chargement et l'interface ne doit pas les afficher en creux :
 * {@link hasInfrastructureView} dit si on les a reçus.</p>
 */
export interface GameServerDto {
  id?: string;
  slug?: string;
  /** le déploiement qui réalise ce serveur — projection infra seulement */
  deploymentId?: number;
  name?: string;
  urlConnection?: string;
  game?: string;
  /** libellé et icône dérivés du jeu, servis par le cœur : ne pas dupliquer le catalogue ici */
  gameLabel?: string;
  gameIconUrl?: string;
  playersMax?: number;
  installation?: string;
  version?: string;
  description?: string;
  /** projection infra seulement */
  admins?: ServerAdminDto[];
  /** projection infra seulement */
  ports?: GameServerPortDto[];
  status?: string;
  lastStatusCheckAt?: string;
  lastStatusChangeAt?: string;
  statusHistory?: GameServerStatusHistoryEntryDto[];
}

export interface GameServerStatusHistoryEntryDto {
  status?: string;
  observedAt?: string;
}

/**
 * Vrai si cette réponse porte la projection infra.
 *
 * <p>Le test porte sur `ports`, et non sur `admins` : un serveur sans administrateur déclaré est
 * normal, un serveur sans tableau de ports du tout ne l'est que si le cœur l'a retiré. La
 * projection infra renvoie toujours les deux tableaux, fussent-ils vides.</p>
 */
export const hasInfrastructureView = (server: GameServerDto): boolean =>
  Array.isArray(server.ports) || Array.isArray(server.admins);

/**
 * Vue publique. Le cœur y retire délibérément tout ce qui révèle l'infrastructure : pas de
 * déploiement, pas de ports, pas d'admins — et pas de date d'observation.
 */
export interface PublicServerStatusDto {
  name?: string;
  game?: string;
  status?: string;
}

export interface UpsertGameServerPayload {
  slug: string;
  deploymentId?: number;
  name: string;
  urlConnection?: string;
  game?: string;
  playersMax?: number;
  installation?: string;
  version?: string;
  description?: string;
  /**
   * Les administrateurs, **en objets porteurs d'un `userId`** et non en chaînes : c'est la même
   * forme en entrée qu'en sortie, et le cœur n'y lit que `userId`. Omettre le champ laisse la
   * liste inchangée côté cœur ; l'envoyer vide la vide.
   */
  admins?: ServerAdminDto[];
  /** omis = ports inchangés côté cœur */
  ports?: GameServerPortDto[];
}
