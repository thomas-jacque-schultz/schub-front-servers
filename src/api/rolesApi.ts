import { requestJson } from "./httpClient";
import type { Permission } from "../types/permission";
import type { RoleDto } from "../types/user";

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

/**
 * La liste des rôles.
 *
 * <p>Ouverte à `USER_VIEW` **ou** `ROLE_MANAGE`, et pas à `ROLE_MANAGE` seule : l'écran des
 * utilisateurs a besoin des rôles pour proposer un choix. Ce que la décision n°2 protège, c'est
 * la *composition* d'un rôle, pas la connaissance de son nom.</p>
 */
export const getRolesApi = async (token: string): Promise<RoleDto[]> =>
  requestJson<RoleDto[]>("/roles", { method: "GET", headers: authHeader(token) });

/** Réservé à `ROLE_MANAGE`, donc au seul `OWNER`. */
export const updateRoleApi = async (
  token: string,
  roleId: string,
  payload: { name: string; permissions: Permission[] },
): Promise<RoleDto> =>
  requestJson<RoleDto>(`/roles/${roleId}`, {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify({ id: roleId, ...payload }),
  });

export const createRoleApi = async (
  token: string,
  payload: { name: string; permissions: Permission[] },
): Promise<RoleDto> =>
  requestJson<RoleDto>("/roles", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });

export const deleteRoleApi = async (token: string, roleId: string): Promise<void> => {
  await requestJson<unknown>(`/roles/${roleId}`, { method: "DELETE", headers: authHeader(token) });
};
