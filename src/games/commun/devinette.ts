// Ce que tous les jeux à deviner partagent : la comparaison tolérante, le fil des réponses, les joueurs présents.

export interface Ligne {
  joueur: string;
  texte?: string;
  trouve?: boolean;
}

export interface Present {
  id: string;
  name: string;
}

export type Hasard = () => number;

const FIL_MAX = 30;

/** Kai'Sa, kaisa et KAISA se valent : casse, accents, apostrophes, points et espaces ignorés. */
export const normalise = (texte: string): string =>
  texte
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");

/** Distance d'édition, arrêtée dès qu'elle dépasse max. */
export const distance = (a: string, b: string, max = 1): number => {
  if (Math.abs(a.length - b.length) > max) {
    return max + 1;
  }
  let precedente = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const ligne = [i];
    for (let j = 1; j <= b.length; j++) {
      ligne[j] = Math.min(
        precedente[j] + 1,
        ligne[j - 1] + 1,
        precedente[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    if (Math.min(...ligne) > max) {
      return max + 1;
    }
    precedente = ligne;
  }
  return precedente[b.length];
};

export type Verdict = "juste" | "proche" | "faux";

export const compare = (essai: string, attendu: string): Verdict => {
  const a = normalise(essai);
  const b = normalise(attendu);
  if (a === b) {
    return "juste";
  }
  return distance(a, b) <= 1 ? "proche" : "faux";
};

export const ajouteAuFil = (fil: Ligne[], ligne: Ligne): Ligne[] =>
  [...fil, ligne].slice(-FIL_MAX);

export const tire = <T>(reserve: T[], n: number, hasard: Hasard) => {
  const restants = [...reserve];
  const tires: T[] = [];
  while (tires.length < n && restants.length > 0) {
    tires.push(...restants.splice(Math.floor(hasard() * restants.length), 1));
  }
  return { tires, restants };
};
