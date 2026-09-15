import { requestJson } from "./httpClient";
import type { PortRuleDto, StaticPortRuleDto } from "../types/portForwarding";

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

/**
 * L'état réel du routeur, redirections manuelles comprises.
 * À ne pas confondre avec les règles permanentes : celles-ci sont ce que l'application
 * *veut*, celles-là ce que le routeur *porte*.
 */
export const getPortRulesApi = async (token: string): Promise<PortRuleDto[]> =>
  requestJson<PortRuleDto[]>("/bot/port-forwarding/rules", {
    method: "GET",
    headers: authHeader(token),
  });

/** Les règles permanentes détenues par l'application — les seules qu'elle sait supprimer. */
export const getStaticPortRulesApi = async (token: string): Promise<StaticPortRuleDto[]> =>
  requestJson<StaticPortRuleDto[]>("/bot/port-forwarding/static-rules", {
    method: "GET",
    headers: authHeader(token),
  });

export const createStaticPortRuleApi = async (
  token: string,
  rule: StaticPortRuleDto,
): Promise<StaticPortRuleDto> =>
  requestJson<StaticPortRuleDto>("/bot/port-forwarding/static-rules", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(rule),
  });

export const deleteStaticPortRuleApi = async (token: string, id: string): Promise<void> => {
  await requestJson<unknown>(`/bot/port-forwarding/static-rules/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
};
