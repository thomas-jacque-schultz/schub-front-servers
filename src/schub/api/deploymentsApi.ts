import { requestJson } from "../../common";
import type { DeploymentDto } from "../types/deployment";

export const getDeploymentsApi = async (): Promise<DeploymentDto[]> =>
  requestJson<DeploymentDto[]>("/deployments", { method: "GET" });
