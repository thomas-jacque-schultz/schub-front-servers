import type { Champion } from "../commun/champions";
import {
  ajouteAuFil,
  compare,
  type Hasard,
  type Ligne,
  type Present,
  tire,
} from "../commun/devinette";

// Les règles du scribble (Schub#130). Elles tournent chez le meneur, qui diffuse l'état entier à chaque
// changement : un joueur qui arrive le reçoit au suivant, et le joueur suivant reprend si le meneur part.

export type Phase = "choix" | "dessin" | "bilan" | "fin";

export interface Partie {
  phase: Phase;
  lang: string;
  // La version de Data Dragon des icônes.
  version: string;
  duree: number;
  // Un tour : chacun dessine une fois. tour est le rang du dessinateur dans ordre, cycle le tour en cours.
  tours: number;
  cycle: number;
  ordre: string[];
  tour: number;
  dessinateur: string;
  choix: Champion[];
  mot: Champion | null;
  revele: number[];
  devineurs: string[];
  trouve: string[];
  scores: Record<string, number>;
  noms: Record<string, string>;
  fil: Ligne[];
  restantMs: number;
  reserve: Champion[];
}

export const DUREES = [40, 60, 80, 100, 120];
export const DUREE_DEFAUT = 80;
export const TOURS = [1, 2, 3];
export const TOURS_DEFAUT = 1;
export const CHOIX_MS = 15_000;
export const BILAN_MS = 5_000;
const POINTS_DEVINEUR = 50;
const POINTS_DEVINEUR_RAPIDITE = 50;
const POINTS_DESSINATEUR = 25;

const estLettre = (caractere: string) => /[\p{L}\p{N}]/u.test(caractere);

export const lettres = (mot: string): number =>
  [...mot].filter(estLettre).length;

/** Le mot tel que le voit qui devine : les lettres cachées, la ponctuation et les espaces visibles. */
export const masque = (mot: string, revele: number[]): string =>
  [...mot]
    .map((caractere, index) =>
      !estLettre(caractere) || revele.includes(index) ? caractere : "_",
    )
    .join("");

const manche = (
  p: Partie,
  tour: number,
  presents: Present[],
  hasard: Hasard,
): Partie => {
  const ids = presents.map((j) => j.id);
  const present = (rang: number) => ids.includes(p.ordre[rang]);
  let cycle = p.cycle;
  let suivant = tour;
  while (suivant < p.ordre.length && !present(suivant)) {
    suivant++;
  }
  if (suivant >= p.ordre.length && cycle < p.tours) {
    cycle++;
    suivant = 0;
    while (suivant < p.ordre.length && !present(suivant)) {
      suivant++;
    }
  }
  const { tires, restants } = tire(p.reserve, 3, hasard);
  if (suivant >= p.ordre.length || ids.length < 2 || tires.length === 0) {
    return { ...p, phase: "fin", choix: [], restantMs: 0 };
  }
  return {
    ...p,
    phase: "choix",
    cycle,
    tour: suivant,
    dessinateur: p.ordre[suivant],
    choix: tires,
    mot: null,
    revele: [],
    devineurs: ids.filter((id) => id !== p.ordre[suivant]),
    trouve: [],
    restantMs: CHOIX_MS,
    reserve: restants,
  };
};

export const nouvellePartie = (
  presents: Present[],
  duree: number,
  tours: number,
  lang: string,
  version: string,
  mots: Champion[],
  hasard: Hasard,
): Partie =>
  manche(
    {
      phase: "choix",
      lang,
      version,
      duree,
      tours,
      cycle: 1,
      ordre: presents.map((j) => j.id),
      tour: 0,
      dessinateur: presents[0]?.id ?? "",
      choix: [],
      mot: null,
      revele: [],
      devineurs: [],
      trouve: [],
      scores: Object.fromEntries(presents.map((j) => [j.id, 0])),
      noms: Object.fromEntries(presents.map((j) => [j.id, j.name])),
      fil: [],
      restantMs: 0,
      reserve: mots,
    },
    0,
    presents,
    hasard,
  );

export const choisir = (p: Partie, index: number): Partie => {
  const mot = p.choix[index];
  if (p.phase !== "choix" || mot === undefined) {
    return p;
  }
  return {
    ...p,
    phase: "dessin",
    mot,
    reserve: [...p.reserve, ...p.choix.filter((_, i) => i !== index)],
    choix: [],
    restantMs: p.duree * 1000,
  };
};

const bilan = (p: Partie): Partie => ({
  ...p,
  phase: "bilan",
  restantMs: BILAN_MS,
});

/** proche : à une lettre du mot, à dire au seul joueur qui l'a tapé ; la réponse ne va pas dans le fil. */
export const deviner = (
  p: Partie,
  joueur: string,
  texte: string,
): { partie: Partie; proche: boolean } => {
  const propre = texte.trim().slice(0, 60);
  if (
    p.phase !== "dessin" ||
    !p.mot ||
    !propre ||
    !p.devineurs.includes(joueur) ||
    p.trouve.includes(joueur)
  ) {
    return { partie: p, proche: false };
  }
  const verdict = compare(propre, p.mot.nom);
  if (verdict === "juste") {
    const rapidite = p.restantMs / (p.duree * 1000);
    const gain =
      POINTS_DEVINEUR + Math.round(POINTS_DEVINEUR_RAPIDITE * rapidite);
    const suite: Partie = {
      ...p,
      trouve: [...p.trouve, joueur],
      scores: {
        ...p.scores,
        [joueur]: (p.scores[joueur] ?? 0) + gain,
        [p.dessinateur]: (p.scores[p.dessinateur] ?? 0) + POINTS_DESSINATEUR,
      },
      fil: ajouteAuFil(p.fil, { joueur, trouve: true }),
    };
    return {
      partie: p.devineurs.every((id) => suite.trouve.includes(id))
        ? bilan(suite)
        : suite,
      proche: false,
    };
  }
  if (verdict === "proche") {
    return { partie: p, proche: true };
  }
  return {
    partie: { ...p, fil: ajouteAuFil(p.fil, { joueur, texte: propre }) },
    proche: false,
  };
};

// Une lettre à mi-temps, une autre aux trois quarts ; jamais plus d'un tiers du mot.
const indices = (p: Partie, hasard: Hasard): number[] => {
  if (!p.mot) {
    return p.revele;
  }
  const ecoule = 1 - p.restantMs / (p.duree * 1000);
  const voulu = (ecoule >= 0.5 ? 1 : 0) + (ecoule >= 0.75 ? 1 : 0);
  const plafond = Math.floor(lettres(p.mot.nom) / 3);
  const cachees = [...p.mot.nom]
    .map((caractere, index) => (estLettre(caractere) ? index : -1))
    .filter((index) => index >= 0 && !p.revele.includes(index));
  const revele = [...p.revele];
  while (revele.length < Math.min(voulu, plafond) && cachees.length > 0) {
    revele.push(...cachees.splice(Math.floor(hasard() * cachees.length), 1));
  }
  return revele;
};

/** Le temps qui passe, chez le meneur : indices, fin de manche, manche suivante. */
export const avancer = (
  p: Partie,
  ecouleMs: number,
  presents: Present[],
  hasard: Hasard,
): Partie => {
  if (p.phase === "fin") {
    return p;
  }
  const restantMs = Math.max(0, p.restantMs - ecouleMs);
  const suite: Partie = { ...p, restantMs };
  if (p.phase === "choix") {
    return restantMs === 0 ? choisir(suite, 0) : suite;
  }
  if (p.phase === "dessin") {
    return restantMs === 0
      ? bilan(suite)
      : { ...suite, revele: indices(suite, hasard) };
  }
  return restantMs === 0 ? manche(suite, p.tour + 1, presents, hasard) : suite;
};

/**
 * Qui arrive dessinera plus tard dans le tour et devinera dès la manche suivante. Un dessinateur parti clôt la
 * manche, comme le départ du dernier qui n'avait pas trouvé.
 */
export const presence = (p: Partie, presents: Present[]): Partie => {
  const ids = presents.map((j) => j.id);
  const nouveaux = presents.filter((j) => !p.ordre.includes(j.id));
  const suite: Partie = {
    ...p,
    ordre: [...p.ordre, ...nouveaux.map((j) => j.id)],
    scores: {
      ...Object.fromEntries(nouveaux.map((j) => [j.id, 0])),
      ...p.scores,
    },
    noms: {
      ...p.noms,
      ...Object.fromEntries(presents.map((j) => [j.id, j.name])),
    },
    devineurs: p.devineurs.filter((id) => ids.includes(id)),
  };
  const enJeu = p.phase === "dessin" || p.phase === "choix";
  const tousTrouve =
    p.phase === "dessin" &&
    suite.devineurs.every((id) => suite.trouve.includes(id));
  if (enJeu && (!ids.includes(p.dessinateur) || tousTrouve)) {
    return bilan(suite);
  }
  return suite;
};

export const estPartie = (data: unknown): data is Partie => {
  const p = data as Partial<Partie> | null;
  return (
    typeof p?.phase === "string" &&
    Array.isArray(p.ordre) &&
    typeof p.scores === "object" &&
    typeof p.restantMs === "number"
  );
};
