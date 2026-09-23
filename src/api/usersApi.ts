import { requestJson } from "./httpClient";
import type { AssignRoleRequest, UserDto } from "../types/user";

export const getUsersApi = async (): Promise<UserDto[]> =>
  requestJson<UserDto[]>("/users", { method: "GET" });

export const assignUserRoleApi = async (userId: string, roleId: string): Promise<UserDto> =>
  requestJson<UserDto>(`/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ roleId } satisfies AssignRoleRequest),
  });
