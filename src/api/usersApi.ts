import { requestJson } from "./httpClient";
import type { AssignRoleRequest, UserDto } from "../types/user";

/** La liste des comptes. Réservée à `USER_VIEW` par le BFF. */
export const getUsersApi = async (): Promise<UserDto[]> =>
  requestJson<UserDto[]>("/users", { method: "GET" });

/**
 * Attribue un rôle à un compte.
 *
 * <p>Les garde-fous sont dans le cœur — on n'attribue pas un rôle plus puissant que le sien, ni
 * `OWNER`, ni son propre rôle, et on ne rétrograde pas le dernier `OWNER`. L'IHM les rejoue
 * pour ne pas proposer ce qui sera refusé, mais c'est le cœur qui tranche.</p>
 */
export const assignUserRoleApi = async (userId: string, roleId: string): Promise<UserDto> =>
  requestJson<UserDto>(`/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ roleId } satisfies AssignRoleRequest),
  });
