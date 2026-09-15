/** Une stack telle que Portainer la connaît, réduite à ce qui sert à la choisir. */
export interface PortainerStackDto {
  id: number;
  name: string;
  endpointId?: number | null;
  /** Indicatif : aide à reconnaître la bonne stack, n'est pas un état courant fiable. */
  running: boolean;
}

/**
 * Dérive l'identifiant métier du nom de la stack.
 *
 * L'identifiant sert de clé d'unicité, de propriétaire des règles de ports et d'argument aux
 * commandes Discord : il doit rester simple et stable. Le déduire du nom de la stack évite
 * qu'il diverge de ce que Portainer expose, sans pour autant l'y enchaîner.
 */
export const identifierFromStackName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
