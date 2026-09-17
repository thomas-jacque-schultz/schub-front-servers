import { requestJson } from "./httpClient";
import type { DeploymentDto } from "../types/deployment";

/**
 * Le catalogue des déploiements, pour lier un serveur sans saisie manuelle.
 *
 * `deploymentId` est une clé de liaison : une faute de frappe ne se voit qu'au premier
 * démarrage raté, longtemps après la saisie.
 */
export const getDeploymentsApi = async (token: string): Promise<DeploymentDto[]> =>
  requestJson<DeploymentDto[]>("/deployments", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
