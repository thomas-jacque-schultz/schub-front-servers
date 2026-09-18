import { requestJson } from "./httpClient";
import { isPermission } from "../types/permission";
import type { Permission } from "../types/permission";
import type {
  AuthMeResponse,
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
} from "../types/auth";

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

/**
 * Les permissions servies par le BFF, filtrées sur celles que ce front connaît.
 *
 * <p>Une permission inconnue est ignorée plutôt que propagée : le cœur peut en ajouter une avant
 * que le front sache quoi en faire (les `SCRIM_*` du chantier D, par exemple), et la garder ne
 * ferait qu'introduire une valeur que rien ici ne teste.</p>
 */
const normalizePermissions = (permissions?: string[]): Permission[] =>
  (permissions ?? []).filter(isPermission);

export const loginApi = async (payload: LoginRequest): Promise<LoginResponse> =>
  requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMeApi = async (token: string): Promise<AuthenticatedUser> => {
  const response = await requestJson<AuthMeResponse>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    actorId: response.actorId,
    username: response.username,
    roles: normalizeRoles(response.roles || []),
    permissions: normalizePermissions(response.permissions),
  };
};
