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
 * Un serveur tel que le cœur l'expose, depuis la phase 4.
 *
 * <p>Vocabulaire du §2 : `slug` remplace `identifier`, `deploymentId` remplace
 * `portainerStackId`, `game` remplace `gameName`. Le front ne nomme plus la marque de l'outil
 * qui réalise le serveur.</p>
 */
export interface GameServerDto {
  id?: string;
  slug?: string;
  /** le déploiement qui réalise ce serveur */
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
  admins?: string[];
  ports?: GameServerPortDto[];
  status?: string;
  lastStatusCheckAt?: string;
  lastStatusChangeAt?: string;
}

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
  admins: string[];
  /** omis = ports inchangés côté cœur */
  ports?: GameServerPortDto[];
}
