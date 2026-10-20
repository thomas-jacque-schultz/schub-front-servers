import type { Schemas } from "../../common";

export type ServerStatus = "online" | "offline" | "unknown" | "unreachable";

export type GameServerFormMode = "creation" | "edition" | "visualisation";

export type GameServerCommandFailureDto =
  Schemas["GameServerCommandFailureDto"];

export type GameServerReferentDto = Schemas["GameServerReferentDto"];

export interface DisplayedServer {
  id?: string | null;
  slug?: string | null;
  name: string;
  status: ServerStatus;
  lastStatusCheckAt?: string | null;
  lastCommandFailure?: GameServerCommandFailureDto | null;
  referents?: GameServerReferentDto[] | null;
  viewerCanControl?: boolean;
}

export type GameServerPortDto = Schemas["GameServerPortDto"];

// La projection membre, et les champs d'infrastructure quand le lecteur a SERVER_INFRA_VIEW.
export type GameServerDto = Schemas["GameServerMemberDto"] &
  Partial<
    Pick<Schemas["GameServerDto"], "deploymentId" | "ports" | "referentIds">
  >;

export type GameServerStatusHistoryEntryDto =
  Schemas["GameServerStatusHistoryEntryDto"];

// La projection infra rend toujours un tableau de ports : son absence signale la projection membre.
export const hasInfrastructureView = (server: GameServerDto): boolean =>
  Array.isArray(server.ports);

export type PublicServerStatusDto = Schemas["PublicServerStatusDto"];

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
