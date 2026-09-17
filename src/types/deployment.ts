/**
 * Un déploiement : la stack qui réalise concrètement un serveur de jeu.
 *
 * Ce type s'appelait `DeploymentDto`. Le cœur expose `/deployments` et ne nomme plus la
 * marque de l'outil — le jour où Portainer est remplacé, le front n'a pas à bouger.
 */
export interface DeploymentDto {
  id: number;
  name: string;
  endpointId?: number | null;
  /** Indicatif : aide à reconnaître le bon déploiement, n'est pas un état courant fiable. */
  running: boolean;
}

/**
 * Dérive le slug du nom du déploiement.
 *
 * Le slug sert de clé d'unicité, de propriétaire des règles de ports et d'argument aux
 * commandes Discord : il doit rester simple et stable. Le déduire du nom du déploiement évite
 * qu'il diverge de ce que le cœur expose, sans pour autant l'y enchaîner.
 */
export const slugFromDeploymentName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
