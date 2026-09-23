import { requestJson } from "./httpClient";
import type { DeploymentDto } from "../types/deployment";

export const getDeploymentsApi = async (): Promise<DeploymentDto[]> =>
  requestJson<DeploymentDto[]>("/deployments", { method: "GET" });
