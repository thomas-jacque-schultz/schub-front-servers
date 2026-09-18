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

export const getGameServersApi = async (token?: string): Promise<GameServerDto[]> => {
  return requestJson<GameServerDto[]>("/game-servers", {
    method: "GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
};

/**
 * Cherche par identifiant Mongo OU par slug.
 *
 * Le cœur expose `GET /game-servers/{id}`, mais il ne résout que l'identifiant Mongo. Les
 * appelants d'ici passent parfois un slug, d'où cette recherche côté client — conservée telle
 * quelle en phase 4 pour ne pas changer un comportement au passage. À reprendre quand le cœur
 * saura résoudre les deux (phase 6).
 */
export const getGameServerByIdApi = async (
  token: string,
  id: string,
): Promise<GameServerDto | null> => {
  const servers = await getGameServersApi(token);
  return servers.find((server) => server.id === id || server.slug === id) || null;
};

export const createGameServerApi = async (
  token: string,
  payload: UpsertGameServerPayload,
): Promise<GameServerDto> => {
  return requestJson<GameServerDto>("/game-servers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const updateGameServerApi = async (
  token: string,
  id: string,
  payload: UpsertGameServerPayload,
): Promise<GameServerDto> => {
  return requestJson<GameServerDto>(`/game-servers/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const getDisplayedServersApi = async (
  token?: string,
): Promise<DisplayedServer[]> => {
  try {
    const response = await getGameServersApi(token);

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

/**
 * Démarrage et arrêt, par slug.
 *
 * Avant la phase 4, le front passait par `/gaming-server/command/{start|pause}` du connecteur
 * Discord, avec l'identifiant en corps de requête. Démarrer un serveur est une action de
 * domaine : elle appartient au cœur. Le cœur répond 204, sans corps.
 */
export const startGameServerApi = async (token: string, slug: string): Promise<void> => {
  await requestJson<void>(`/game-servers/${slug}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const stopGameServerApi = async (token: string, slug: string): Promise<void> => {
  await requestJson<void>(`/game-servers/${slug}/stop`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
