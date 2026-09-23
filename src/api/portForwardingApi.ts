import { requestJson } from "./httpClient";
import type { PortRuleDto, StaticPortRuleDto } from "../types/portForwarding";

export const getPortRulesApi = async (): Promise<PortRuleDto[]> =>
  requestJson<PortRuleDto[]>("/port-forwarding/rules", { method: "GET" });

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
