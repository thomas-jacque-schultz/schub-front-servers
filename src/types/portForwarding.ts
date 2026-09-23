export interface PortRuleDto {
  providerId?: string | null;
  // static/<nom> : règle permanente, supprimable ; <slug> : dérivée d'un serveur ; null : manuelle, jamais touchée.
  owner?: string | null;
  protocol: "TCP" | "UDP";
  wanPortStart: number;
  wanPortEnd: number;
  lanIp: string;
  lanPort: number;
  open: boolean;
}

export interface StaticPortRuleDto {
  id?: string;
  name: string;
  proto: string;
  wanPortStart: number;
  wanPortEnd?: number | null;
  lanPort?: number | null;
  lanIp?: string | null;
  enabled: boolean;
}

export const STATIC_OWNER_PREFIX = "static/";

export type PortRuleOrigin = "static" | "server" | "manual";

export const originOf = (owner?: string | null): PortRuleOrigin => {
  if (!owner) return "manual";
  return owner.startsWith(STATIC_OWNER_PREFIX) ? "static" : "server";
};

export const staticNameOf = (owner: string): string => owner.slice(STATIC_OWNER_PREFIX.length);
