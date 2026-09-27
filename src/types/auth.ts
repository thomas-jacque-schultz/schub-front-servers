import type { Permission } from "./permission";

export interface AuthorityDto {
  authority: string;
}

/** Les comptes liés : ce qu'ils ouvrent (Discord : les serveurs ; Riot : les statistiques). */
export interface AccountLinks {
  discord: boolean;
  riot: boolean;
}

// userId = identifiant interne, sujet du jeton.
export interface AuthMeResponse {
  userId: string;
  username: string;
  roles: Array<string | AuthorityDto>;
  permissions?: string[];
  links?: AccountLinks;
}

export interface AuthenticatedUser {
  userId: string;
  username: string;
  roles: string[];
  permissions: Permission[];
  links: AccountLinks;
}
