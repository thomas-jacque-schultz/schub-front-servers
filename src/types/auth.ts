import type { Permission } from "./permission";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface AuthorityDto {
  authority: string;
}

/**
 * Ce que renvoie `GET /auth/me` depuis le lot A.1.
 *
 * <p>Attention au contenu réel, qui n'est pas un profil complet : le BFF lit le **jeton**, pas le
 * cœur, pour que `/auth/me` dise exactement ce que le BFF appliquera. Il n'y a donc ni avatar ni
 * identifiant interne ici — seulement l'identifiant Discord de l'acteur, son pseudo, ses rôles
 * et ses permissions.</p>
 */
export interface AuthMeResponse {
  /** L'identifiant **Discord** de l'acteur : c'est le sujet du jeton, pas l'id interne du compte. */
  actorId: string;
  username: string;
  roles: Array<string | AuthorityDto>;
  permissions?: string[];
}

export interface AuthenticatedUser {
  actorId: string;
  username: string;
  roles: string[];
  /** Les permissions du rôle seul. Ce qu'un compte tient d'être admin d'un serveur n'y est pas. */
  permissions: Permission[];
}
