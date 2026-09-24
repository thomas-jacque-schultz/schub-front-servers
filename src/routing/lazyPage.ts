import { type ComponentType, lazy } from "react";

const CLE = "schub-rechargement-version";

const lire = () => {
  try {
    return sessionStorage.getItem(CLE);
  } catch {
    return "indisponible";
  }
};

const ecrire = (valeur: string | null) => {
  try {
    if (valeur === null) {
      sessionStorage.removeItem(CLE);
    } else {
      sessionStorage.setItem(CLE, valeur);
    }
  } catch {
    // Sans stockage de session, pas de rechargement : on ne saurait pas éviter la boucle.
  }
};

/**
 * Un écran chargé à la demande. Après un déploiement, un onglet resté ouvert réclame des fichiers qui
 * n'existent plus : l'import échoue et la page resterait blanche. On recharge alors une fois, pour
 * prendre la nouvelle version ; si l'échec persiste, l'erreur remonte.
 */
export const lazyPage = <T extends ComponentType<object>>(
  charger: () => Promise<{ default: T }>,
) =>
  lazy(async () => {
    try {
      const module = await charger();
      ecrire(null);
      return module;
    } catch (erreur) {
      if (lire() === null) {
        ecrire("1");
        window.location.reload();
        return new Promise<never>(() => {});
      }
      throw erreur;
    }
  });
