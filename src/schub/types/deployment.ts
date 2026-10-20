import type { Schemas } from "../../common";

export type DeploymentDto = Schemas["PortainerStackDto"];

export const slugFromDeploymentName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
