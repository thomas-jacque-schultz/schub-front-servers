import type { Permission } from "./permission";

export interface UserDto {
  id: string;
  discordId: string;
  discordUsername?: string | null;
  avatarUrl?: string | null;
  roleId?: string | null;
  roleName?: string | null;
  riotGameName?: string | null;
  riotTagLine?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
}

export interface RoleDto {
  id: string;
  name: string;
  permissions: Permission[];
  system: boolean;
}

export interface AssignRoleRequest {
  roleId: string;
}

export const riotAccountOf = (user: UserDto): string | null =>
  user.riotGameName ? `${user.riotGameName}#${user.riotTagLine ?? ""}`.replace(/#$/, "") : null;

export const userLabelOf = (user: Pick<UserDto, "id" | "discordUsername">): string =>
  user.discordUsername?.trim() || user.id;
