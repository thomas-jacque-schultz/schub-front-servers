import type { Permission } from "./permission";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthorityDto {
  authority: string;
}

/**
 * Ce que renvoie `GET /auth/me`.
 *
 * <p>Attention au contenu réel, qui n'est pas un profil complet : le BFF lit le **jeton**, pas le
 * cœur, pour que `/auth/me` dise exactement ce que le BFF appliquera. Il n'y a donc ni avatar ni
 * date de dernière connexion ici.</p>
 *
 * <p><strong>`actorId` et `userId` ne sont pas la même chose.</strong> `actorId` est
 * l'identifiant *Discord*, sujet du jeton ; `userId` est l'identifiant *interne* du compte, et
 * c'est lui seul que contiennent les `admins` d'un serveur (plan §A.4). Le second a été ajouté
 * par le back avec le lot A.3 : sans lui, le front n'avait rien à comparer.</p>
 *
 * <p>Cette route est le **seul** juge de l'état connecté depuis la décision n°4 : le jeton vit
 * dans un cookie `httpOnly` que le front ne voit pas. Une réponse 200 veut dire « connecté », un
 * 401 veut dire « pas connecté », et il n'y a rien d'autre à consulter.</p>
 */
export interface AuthMeResponse {
  /** L'identifiant **Discord** de l'acteur : c'est le sujet du jeton, pas l'id interne du compte. */
  actorId: string;
  /** L'identifiant **interne** du compte. Peut être nul pour un jeton émis avant le lot A.3. */
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
  /** Les permissions du rôle seul. Ce qu'un compte tient d'être admin d'un serveur n'y est pas. */
  permissions: Permission[];
}
