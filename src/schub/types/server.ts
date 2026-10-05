export type ServerStatus = "online" | "offline" | "unknown" | "unreachable";

export type GameServerFormMode = "creation" | "edition" | "visualisation";

export interface GameServerCommandFailureDto {
  action: "start" | "stop";
  message?: string;
  at?: string;
}

export interface GameServerReferentDto {
  id: string;
  displayName?: string;
  discordId?: string;
}

export interface DisplayedServer {
  id?: string;
  slug?: string;
  name: string;
  status: ServerStatus;
  lastStatusCheckAt?: string;
  lastCommandFailure?: GameServerCommandFailureDto;
  referents?: GameServerReferentDto[];
  viewerCanControl?: boolean;
}

export interface GameServerPortDto {
  proto: string;
  wanPort: number;
  lanPort?: number;
  lanIp?: string;
}

export interface GameServerDto {
  id?: string;
  slug?: string;
  deploymentId?: number;
  name?: string;
  urlConnection?: string;
  game?: string;
  gameLabel?: string;
  gameIconUrl?: string;
  playersMax?: number;
  installation?: string;
  version?: string;
  description?: string;
  ports?: GameServerPortDto[];
  status?: string;
  lastStatusCheckAt?: string;
  lastStatusChangeAt?: string;
  statusHistory?: GameServerStatusHistoryEntryDto[];
  lastCommandFailure?: GameServerCommandFailureDto;
  referentIds?: string[];
  referents?: GameServerReferentDto[];
  viewerCanControl?: boolean;
}

export interface GameServerStatusHistoryEntryDto {
  status?: string;
  observedAt?: string;
}

// La projection infra rend toujours un tableau de ports : son absence signale la projection membre.
export const hasInfrastructureView = (server: GameServerDto): boolean =>
  Array.isArray(server.ports);

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
  ports?: GameServerPortDto[];
  referentIds?: string[];
}
