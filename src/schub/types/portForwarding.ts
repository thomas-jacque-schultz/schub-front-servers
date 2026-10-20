import type { Schemas } from "../../common";

export type PortRuleDto = Schemas["PortRuleDto"];

export type StaticPortRuleDto = Schemas["StaticPortRuleDto"];

export type StaticPortRuleRequest = Schemas["StaticPortRuleRequest"];

export const STATIC_OWNER_PREFIX = "static/";

export type PortRuleOrigin = "static" | "server" | "manual";

export const originOf = (owner?: string | null): PortRuleOrigin => {
  if (!owner) return "manual";
  return owner.startsWith(STATIC_OWNER_PREFIX) ? "static" : "server";
};

export const staticNameOf = (owner: string): string =>
  owner.slice(STATIC_OWNER_PREFIX.length);
