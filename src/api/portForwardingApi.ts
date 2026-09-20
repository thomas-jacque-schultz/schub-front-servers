import { requestJson } from "./httpClient";
import type { PortRuleDto, StaticPortRuleDto } from "../types/portForwarding";

/**
 * L'état réel du routeur, redirections manuelles comprises.
 * À ne pas confondre avec les règles permanentes : celles-ci sont ce que l'application
 * *veut*, celles-là ce que le routeur *porte*.
 */
export const getPortRulesApi = async (): Promise<PortRuleDto[]> =>
  requestJson<PortRuleDto[]>("/port-forwarding/rules", { method: "GET" });

/** Les règles permanentes détenues par l'application — les seules qu'elle sait supprimer. */
export const getStaticPortRulesApi = async (): Promise<StaticPortRuleDto[]> =>
  requestJson<StaticPortRuleDto[]>("/port-forwarding/static-rules", { method: "GET" });

export const createStaticPortRuleApi = async (
  rule: StaticPortRuleDto,
): Promise<StaticPortRuleDto> =>
  requestJson<StaticPortRuleDto>("/port-forwarding/static-rules", {
    method: "POST",
    body: JSON.stringify(rule),
  });

export const deleteStaticPortRuleApi = async (id: string): Promise<void> => {
  await requestJson<unknown>(`/port-forwarding/static-rules/${id}`, { method: "DELETE" });
};
