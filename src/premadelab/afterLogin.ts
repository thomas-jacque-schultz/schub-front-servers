const APRES_CONNEXION = "premadelab-apres-connexion";

// sessionStorage lève dans un onglet privé ou avec les données de site bloquées.
export const retenirApresConnexion = (chemin: string): void => {
  try {
    sessionStorage.setItem(APRES_CONNEXION, chemin);
  } catch {
    // Sans stockage de session, on arrive sur l'accueil après la connexion.
  }
};

export const destinationApresConnexion = (): string | null => {
  try {
    const cible = sessionStorage.getItem(APRES_CONNEXION);
    sessionStorage.removeItem(APRES_CONNEXION);
    return cible;
  } catch {
    return null;
  }
};
