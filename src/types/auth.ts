import type { Permission } from "./permission";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthorityDto {
  authority: string;
}

// Lu dans le jeton, pas dans le cœur. actorId = identifiant Discord (sujet du jeton), userId = id interne.
export interface AuthMeResponse {
  actorId: string;
  userId?: string | null;
  username: string;
  roles: Array<string | AuthorityDto>;
  permissions?: string[];
}

export interface AuthenticatedUser {
  actorId: string;
  userId: string | null;
  username: string;
  roles: string[];
  permissions: Permission[];
}
