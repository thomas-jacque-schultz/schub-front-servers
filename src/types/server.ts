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
 * Un serveur tel que le cœur l'expose.
 *
 * <p><strong>Trois projections, une seule forme ici.</strong> Depuis le lot A.1, le cœur choisit
 * ce qu'il envoie selon les permissions de l'acteur :</p>
 * <ul>
 *   <li>sans compte — `PublicServerStatusDto` : nom, jeu, statut ;</li>
 *   <li>avec `SERVER_VIEW` — la projection « membre » : de quoi rejoindre et suivre ;</li>
 *   <li>avec `SERVER_INFRA_VIEW` — en plus : `deploymentId` et `ports`.</li>
 * </ul>
 *
 * <p>Ces champs sont donc **normalement absents** pour un membre. Ce n'est pas une erreur de
 * chargement et l'interface ne doit pas les afficher en creux : {@link hasInfrastructureView}
 * dit si on les a reçus.</p>
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
 * Vrai si cette réponse porte la projection infra, qui rend toujours un tableau de ports,
 * fût-il vide. Son absence est donc le signe de la projection membre, pas d'un serveur sans
 * redirection.
 */
export const hasInfrastructureView = (server: GameServerDto): boolean =>
  Array.isArray(server.ports);

/**
 * Vue publique. Le cœur y retire délibérément tout ce qui révèle l'infrastructure : pas de
 * déploiement, pas de ports — et pas de date d'observation.
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
  /** omis = ports inchangés côté cœur */
  ports?: GameServerPortDto[];
}
