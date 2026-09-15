/** Une redirection telle que le routeur la porte réellement. */
export interface PortRuleDto {
  /** identifiant attribué par le routeur ; absent pour une règle voulue pas encore posée */
  providerId?: string | null;
  /**
   * Qui réclame cette règle.
   *  - `static/<nom>` : règle permanente détenue par l'application, supprimable ;
   *  - `<slug>`       : dérivée d'un serveur de jeu, se modifie via le serveur ;
   *  - `null`         : créée à la main sur le routeur, l'application n'y touche pas.
   */
  owner?: string | null;
  protocol: "TCP" | "UDP";
  wanPortStart: number;
  wanPortEnd: number;
  lanIp: string;
  lanPort: number;
  open: boolean;
}

/** Une règle permanente détenue par l'application, donc modifiable. */
export interface StaticPortRuleDto {
  id?: string;
  name: string;
  /** "tcp" ou "udp" */
  proto: string;
  wanPortStart: number;
  /** absent = port unique */
  wanPortEnd?: number | null;
  /** absent = identique au port WAN */
  lanPort?: number | null;
  /** absent = valeur par défaut du back */
  lanIp?: string | null;
  enabled: boolean;
}

export const STATIC_OWNER_PREFIX = "static/";

export type PortRuleOrigin = "static" | "server" | "manual";

/** D'où vient une règle, et donc ce que l'interface autorise dessus. */
export const originOf = (owner?: string | null): PortRuleOrigin => {
  if (!owner) return "manual";
  return owner.startsWith(STATIC_OWNER_PREFIX) ? "static" : "server";
};

/** Le nom lisible d'une règle permanente, sans son préfixe technique. */
export const staticNameOf = (owner: string): string => owner.slice(STATIC_OWNER_PREFIX.length);
