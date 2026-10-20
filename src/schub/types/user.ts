import type { Schemas } from "../../common";

export type UserDto = Schemas["UserDto"];

export type RoleDto = Schemas["RoleDto"];

export type AssignRoleRequest = Schemas["AssignRoleRequest"];

export const riotAccountOf = (user: UserDto): string | null =>
  user.riotGameName
    ? `${user.riotGameName}#${user.riotTagLine ?? ""}`.replace(/#$/, "")
    : null;

export const userLabelOf = (
  user: Pick<UserDto, "id" | "discordUsername">,
): string => user.discordUsername?.trim() || user.id;

export type ActiveUsersDto = Schemas["Active"];

export type UserStatsDto = Schemas["UserStatsDto"];
