import i18n from "../i18n";
import { ApiError, requestJson } from "./httpClient";
import type {
  DisplayedServer,
  GameServerDto,
  PublicServerStatusDto,
  ServerStatus,
  UpsertGameServerPayload,
} from "../types/server";

const fallbackServers: DisplayedServer[] = [
  { name: "Minecraft - HolyCube", status: "online" },
  { name: "Palworld - Miam", status: "offline" },
  { name: "Satisfactory", status: "online" },
];

const normalizeStatus = (rawStatus?: string): ServerStatus => {
  if (!rawStatus) {
    return "unknown";
  }

  const normalized = rawStatus.toLowerCase();
  if (normalized.includes("up") || normalized.includes("running") || normalized.includes("online")) {
    return "online";
  }
  if (normalized.includes("down") || normalized.includes("stopped") || normalized.includes("offline")) {
    return "offline";
  }
  if (normalized.includes("unreachable")) {
    return "unreachable";
  }

  return "unknown";
};

const toDisplayedServer = (server: GameServerDto): DisplayedServer => ({
  id: server.id,
  slug: server.slug,
  name: server.name || server.slug || i18n.t("errors.unnamed", { ns: "servers" }),
  status: normalizeStatus(server.status),
  lastStatusCheckAt: server.lastStatusCheckAt,
});

const toPublicDisplayedServer = (server: PublicServerStatusDto): DisplayedServer => ({
  name: server.name || i18n.t("errors.unnamed", { ns: "servers" }),
  status: normalizeStatus(server.status),
});

export const getGameServersApi = async (): Promise<GameServerDto[]> =>
  requestJson<GameServerDto[]>("/game-servers", { method: "GET" });

// Le cœur ne résout que l'identifiant Mongo sur GET /game-servers/{id} : la recherche par slug se fait ici.
export const getGameServerByIdApi = async (id: string): Promise<GameServerDto | null> => {
  const servers = await getGameServersApi();
  return servers.find((server) => server.id === id || server.slug === id) || null;
};

export const createGameServerApi = async (
  payload: UpsertGameServerPayload,
): Promise<GameServerDto> =>
  requestJson<GameServerDto>("/game-servers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateGameServerApi = async (
  id: string,
  payload: UpsertGameServerPayload,
): Promise<GameServerDto> =>
  requestJson<GameServerDto>(`/game-servers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const getDisplayedServersApi = async (): Promise<DisplayedServer[]> => {
  try {
    const response = await getGameServersApi();

    return response.map(toDisplayedServer);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return fallbackServers;
    }

    throw error;
  }
};

export const getPublicDisplayedServersApi = async (): Promise<DisplayedServer[]> => {
  try {
    const response = await requestJson<PublicServerStatusDto[]>("/game-servers/public-status", {
      method: "GET",
    });

    return response.map(toPublicDisplayedServer);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return fallbackServers;
    }

    throw error;
  }
};

export const startGameServerApi = async (slug: string): Promise<void> => {
  await requestJson<void>(`/game-servers/${slug}/start`, { method: "POST" });
};

export const stopGameServerApi = async (slug: string): Promise<void> => {
  await requestJson<void>(`/game-servers/${slug}/stop`, { method: "POST" });
};
