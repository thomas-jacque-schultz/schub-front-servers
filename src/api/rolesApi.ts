import { requestJson } from "./httpClient";
import type { Permission } from "../types/permission";
import type { RoleDto } from "../types/user";

/**
 * La liste des rôles.
 *
 * <p>Ouverte à `USER_VIEW` **ou** `ROLE_MANAGE`, et pas à `ROLE_MANAGE` seule : l'écran des
 * utilisateurs a besoin des rôles pour proposer un choix. Ce que la décision n°2 protège, c'est
 * la *composition* d'un rôle, pas la connaissance de son nom.</p>
 */
export const getRolesApi = async (): Promise<RoleDto[]> =>
  requestJson<RoleDto[]>("/roles", { method: "GET" });

/** Réservé à `ROLE_MANAGE`, donc au seul `OWNER`. */
export const updateRoleApi = async (
  roleId: string,
  payload: { name: string; permissions: Permission[] },
): Promise<RoleDto> =>
  requestJson<RoleDto>(`/roles/${roleId}`, {
    method: "PUT",
    body: JSON.stringify({ id: roleId, ...payload }),
  });

export const createRoleApi = async (payload: {
  name: string;
  permissions: Permission[];
}): Promise<RoleDto> =>
  requestJson<RoleDto>("/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteRoleApi = async (roleId: string): Promise<void> => {
  await requestJson<unknown>(`/roles/${roleId}`, { method: "DELETE" });
};
