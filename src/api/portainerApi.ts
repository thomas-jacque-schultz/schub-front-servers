import { requestJson } from "./httpClient";
import type { PortainerStackDto } from "../types/portainer";

/**
 * Le catalogue des stacks Portainer, pour lier un serveur sans saisie manuelle.
 *
 * `portainerStackId` est une clé de liaison : une faute de frappe ne se voit qu'au premier
 * démarrage raté, longtemps après la saisie.
 */
export const getPortainerStacksApi = async (token: string): Promise<PortainerStackDto[]> =>
  requestJson<PortainerStackDto[]>("/bot/portainer/stacks", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
