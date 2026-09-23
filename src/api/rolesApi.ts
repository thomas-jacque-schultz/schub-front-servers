import { requestJson } from "./httpClient";
import type { Permission } from "../types/permission";
import type { RoleDto } from "../types/user";

export const getRolesApi = async (): Promise<RoleDto[]> =>
  requestJson<RoleDto[]>("/roles", { method: "GET" });

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
