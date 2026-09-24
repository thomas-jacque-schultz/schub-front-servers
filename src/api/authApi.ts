import { apiUrl, requestJson } from "./httpClient";
import { isPermission } from "../types/permission";
import type { Permission } from "../types/permission";
import type { AuthMeResponse, AuthenticatedUser } from "../types/auth";

const normalizeRoles = (roles: AuthMeResponse["roles"]): string[] =>
  roles
    .map((role) => {
      if (typeof role === "string") {
        return role;
      }

      if (role && typeof role === "object" && "authority" in role) {
        return String(role.authority);
      }

      return "";
    })
    .filter(Boolean);

// Une permission inconnue du front est ignorée : le cœur peut en ajouter avant que le front sache quoi en faire.
const normalizePermissions = (permissions?: string[]): Permission[] =>
  (permissions ?? []).filter(isPermission);

export const getMeApi = async (): Promise<AuthenticatedUser> => {
  const response = await requestJson<AuthMeResponse>("/auth/me", { method: "GET" });

  return {
    actorId: response.actorId,
    userId: response.userId ?? null,
    username: response.username,
    roles: normalizeRoles(response.roles || []),
    permissions: normalizePermissions(response.permissions),
  };
};

export const logoutApi = async (): Promise<void> => {
  await requestJson<unknown>("/auth/logout", { method: "POST" });
};

// Navigation, pas fetch : GET /auth/discord répond une 302 vers discord.com, qu'un fetch ne peut pas suivre.
export const discordLoginUrl = (): string => apiUrl("/auth/discord");
