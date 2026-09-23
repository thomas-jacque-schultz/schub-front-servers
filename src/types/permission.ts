// Copie de l'enum Permission du cœur, dans le même ordre (il trie la matrice des rôles).
export const PERMISSIONS = [
  "SERVER_VIEW",
  "SERVER_INFRA_VIEW",
  "SERVER_START",
  "SERVER_STOP",
  "SERVER_CREATE",
  "SERVER_EDIT",
  "SERVER_DELETE",
  "PORT_VIEW",
  "PORT_RULE_EDIT",
  "DISCORD_CHANNEL_MANAGE",
  "USER_VIEW",
  "USER_ROLE_ASSIGN",
  "TEAM_CREATE",
  "TEAM_VIEW",
  "TEAM_EDIT",
  "COMPOSITION_EDIT",
  "ROLE_MANAGE",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const RESERVED_PERMISSION: Permission = "ROLE_MANAGE";

export const ASSIGNABLE_PERMISSIONS: readonly Permission[] = PERMISSIONS.filter(
  (permission) => permission !== RESERVED_PERMISSION,
);

export const OWNER_ROLE_NAME = "OWNER";

export const isPermission = (value: string): value is Permission =>
  (PERMISSIONS as readonly string[]).includes(value);
