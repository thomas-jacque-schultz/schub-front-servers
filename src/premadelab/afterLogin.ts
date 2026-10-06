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

const EQUIPE_PROPOSEE = "premadelab-equipe-proposee";

/** Les Riot ID qu'une fiche publique propose de réunir (Schub#96) : la création d'équipe les reprend. */
export const retenirEquipeProposee = (riotIds: string[]): void => {
  try {
    sessionStorage.setItem(EQUIPE_PROPOSEE, JSON.stringify(riotIds));
  } catch {
    // Sans stockage de session, l'équipe se crée vide et s'étoffe à la main.
  }
};

export const equipeProposee = (): string[] => {
  try {
    const brut = sessionStorage.getItem(EQUIPE_PROPOSEE);
    return brut ? (JSON.parse(brut) as string[]) : [];
  } catch {
    return [];
  }
};

export const oublierEquipeProposee = (): void => {
  try {
    sessionStorage.removeItem(EQUIPE_PROPOSEE);
  } catch {
    // rien à oublier
  }
};
