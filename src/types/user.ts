import type { Permission } from "./permission";

/**
 * Un compte tel que `GET /users` l'expose.
 *
 * <p>`roleName` accompagne `roleId` : le cœur le résout une fois pour toute la liste, pour que
 * l'écran des utilisateurs n'ait pas à faire un appel par ligne.</p>
 */
export interface UserDto {
  /** L'identifiant **interne**, la clé du compte dans les collections du cœur. */
  id: string;
  discordId: string;
  discordUsername?: string | null;
  avatarUrl?: string | null;
  roleId?: string | null;
  roleName?: string | null;
  /** Le compte Riot lié, chantier D : nul tant que la liaison n'est pas faite. */
  riotGameName?: string | null;
  riotTagLine?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
}

/**
 * Un rôle tel que le cœur l'expose.
 *
 * <p>`system` sert à griser plutôt qu'à laisser découvrir le refus : un rôle système ne se
 * supprime ni ne se renomme.</p>
 */
export interface RoleDto {
  id: string;
  name: string;
  permissions: Permission[];
  system: boolean;
}

/** Le corps de `PUT /users/{id}/role`. */
export interface AssignRoleRequest {
  roleId: string;
}

/** Le compte Riot lié, mis en forme `pseudo#tag`, ou `null` s'il n'y en a pas. */
export const riotAccountOf = (user: UserDto): string | null =>
  user.riotGameName ? `${user.riotGameName}#${user.riotTagLine ?? ""}`.replace(/#$/, "") : null;

/**
 * Le libellé d'un compte : son pseudo Discord, ou son identifiant interne à défaut.
 *
 * <p>Un compte sans pseudo existe : le cœur en crée un dès qu'un identifiant Discord se
 * présente, et le pseudo n'arrive qu'avec l'appelant qui a parlé à Discord. Afficher une ligne
 * vide ferait disparaître le compte de l'écran sans que personne ne s'en aperçoive.</p>
 */
export const userLabelOf = (user: Pick<UserDto, "id" | "discordUsername">): string =>
  user.discordUsername?.trim() || user.id;
