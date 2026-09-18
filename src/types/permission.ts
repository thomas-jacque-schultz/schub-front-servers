/**
 * Les permissions, recopiées de l'énumération Java `Permission` du cœur.
 *
 * <p>C'est une **liste figée dans le code des deux côtés**, et c'est voulu : une permission ne
 * vaut que par le code qui la vérifie (plan §A.1). Le front la redéclare plutôt que de la lire
 * d'une route, pour que TypeScript refuse `can("SERVER_STRAT")` à la compilation plutôt qu'à
 * l'exécution.</p>
 *
 * <p>L'ordre est celui du cœur : il sert de tri à la matrice de l'écran des rôles, où les
 * permissions d'un même domaine doivent se suivre.</p>
 */
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
  "ROLE_MANAGE",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * La permission qui n'est jamais attribuable (décision n°2 du 18-09).
 *
 * <p>Le cœur la retire silencieusement de tout rôle créé ou modifié par l'API. L'IHM ne la
 * propose donc pas : une case à cocher qui se décocherait toute seule à l'enregistrement est
 * pire qu'une case absente.</p>
 */
export const RESERVED_PERMISSION: Permission = "ROLE_MANAGE";

/** Les permissions que la matrice de l'écran des rôles affiche réellement. */
export const ASSIGNABLE_PERMISSIONS: readonly Permission[] = PERMISSIONS.filter(
  (permission) => permission !== RESERVED_PERMISSION,
);

/** Le nom du rôle réservé, jamais attribuable et jamais modifiable depuis l'IHM. */
export const OWNER_ROLE_NAME = "OWNER";

/** Vrai si la chaîne servie par le back est une permission que ce front connaît. */
export const isPermission = (value: string): value is Permission =>
  (PERMISSIONS as readonly string[]).includes(value);
