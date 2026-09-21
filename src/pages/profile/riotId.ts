/**
 * Le découpage d'un `Pseudo#TAG`.
 *
 * <p>Le cœur refuse en 400 toute autre forme, et il a raison de le faire : c'est lui l'autorité.
 * Ce qui se joue ici est la lisibilité — dire « il faut un # » pendant la saisie plutôt que de
 * laisser découvrir le refus après un aller-retour réseau.</p>
 *
 * <p><strong>La même règle des deux côtés</strong> : exactement un `#`, rien de vide de part et
 * d'autre. Être plus permissif ici enverrait des saisies que le serveur rejette ; être plus
 * strict refuserait des Riot ID valides.</p>
 */
export interface ParsedRiotId {
  gameName: string;
  tagLine: string;
}

export const parseRiotId = (raw: string): ParsedRiotId | null => {
  const parts = raw.trim().split("#");

  if (parts.length !== 2) {
    return null;
  }

  const [gameName, tagLine] = parts.map((part) => part.trim());

  if (!gameName || !tagLine) {
    return null;
  }

  return { gameName, tagLine };
};

/** Vrai si la saisie est recevable. Une saisie vide n'est pas invalide, elle est absente. */
export const isRiotIdComplete = (raw: string): boolean => parseRiotId(raw) !== null;
