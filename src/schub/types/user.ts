import { type Permission } from "../../common";

export interface UserDto {
  id: string;
  discordId: string | null;
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
  user.riotGameName
    ? `${user.riotGameName}#${user.riotTagLine ?? ""}`.replace(/#$/, "")
    : null;

export const userLabelOf = (
  user: Pick<UserDto, "id" | "discordUsername">,
): string => user.discordUsername?.trim() || user.id;

export interface ActiveUsersDto {
  last24h: number;
  last7d: number;
  last30d: number;
}

export interface UserStatsDto {
  total: number;
  riotLinked: number;
  active: ActiveUsersDto;
  activeByApp: Record<"schub" | "premadelab", ActiveUsersDto>;
  /** searchers : personnes distinctes qui ont utilisé la recherche ce jour-là, sans compte ni cookie. */
  daily: { day: string; activeUsers: number; searchers: number }[];
}
