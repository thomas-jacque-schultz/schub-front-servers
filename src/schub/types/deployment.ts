export interface DeploymentDto {
  id: number;
  name: string;
  endpointId?: number | null;
  running: boolean;
}

export const slugFromDeploymentName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
