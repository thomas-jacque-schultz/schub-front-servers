import type { Donnees } from "../commun/ddragon";
import {
  ajouteAuFil,
  compare,
  type Hasard,
  type Ligne,
  normalise,
  type Present,
  tire,
} from "../commun/devinette";

// Indices (Schub#133) : un champion ou un objet, choisi à chaque manche par un joueur, et des indices tirés de
// Data Dragon qui tombent un à un. Plus on trouve tôt, plus on marque. Les indices sont des données : chacun les
// lit dans sa langue, les noms restent dans celle du meneur.

export type Categorie = "champion" | "objet";
export type Phase = "categorie" | "manche" | "bilan" | "fin";

export type Indice =
  | { type: "classes"; classes: string[] }
  | { type: "portee"; aDistance: boolean; ressource: string }
  | { type: "sort"; nom: string }
  | { type: "titre"; texte: string }
  | { type: "prix"; tranche: number }
  | { type: "stats"; lignes: string[] }
  | { type: "composants"; noms: string[] }
  | { type: "description"; texte: string };

export interface Enigme {
  categorie: Categorie;
  id: string;
  nom: string;
  indices: Indice[];
}

export interface PartieIndices {
  phase: Phase;
  lang: string;
  version: string;
  duree: number;
  manches: number;
  manche: number;
  ordre: string[];
  /** Le rang dans ordre de qui choisit la catégorie : on passe au suivant à chaque manche. */
  rang: number;
  choisit: string | null;
  enigme: Enigme | null;
  revele: number;
  devineurs: string[];
  trouve: string[];
  scores: Record<string, number>;
  noms: Record<string, string>;
  fil: Ligne[];
  restantMs: number;
  restants: Record<Categorie, string[]>;
}

export const DUREES = [30, 45, 60];
export const DUREE_DEFAUT = 45;
export const MANCHES = [5, 10, 15];
export const MANCHES_DEFAUT = 10;
export const CATEGORIE_MS = 10_000;
export const BILAN_MS = 5_000;
/** Les points selon le nombre d'indices visibles quand on trouve. */
const POINTS = [100, 70, 45, 25];
/** Les tranches de prix (réponse du 20/10) : un prix exact se devinerait trop vite. */
export const TRANCHES = [100, 1000, 2000, 2750, 3000];

export const tranche = (prix: number): number =>
  TRANCHES.filter((borne) => prix >= borne).length;

const contient = (texte: string, nom: string) =>
  normalise(texte).includes(normalise(nom));

export const enigmeDe = (
  categorie: Categorie,
  id: string,
  donnees: Donnees,
  hasard: Hasard,
): Enigme | null => {
  if (categorie === "champion") {
    const c = donnees.champions.find((champion) => champion.id === id);
    if (!c) {
      return null;
    }
    const sorts = c.sorts.filter((sort) => !contient(sort, c.nom));
    const indices: Indice[] = [
      { type: "classes", classes: c.classes },
      { type: "portee", aDistance: c.aDistance, ressource: c.ressource },
    ];
    if (sorts.length > 0) {
      indices.push({
        type: "sort",
        nom: sorts[Math.floor(hasard() * sorts.length)],
      });
    }
    if (c.titre && !contient(c.titre, c.nom)) {
      indices.push({ type: "titre", texte: c.titre });
    }
    return { categorie, id, nom: c.nom, indices };
  }
  const o = donnees.objets.find((objet) => objet.id === id);
  if (!o) {
    return null;
  }
  const indices: Indice[] = [
    { type: "prix", tranche: tranche(o.prix) },
    { type: "stats", lignes: o.stats },
    {
      type: "composants",
      noms: o.composants.filter((nom) => !contient(nom, o.nom)),
    },
  ];
  if (o.description && !contient(o.description, o.nom)) {
    indices.push({ type: "description", texte: o.description });
  }
  return { categorie, id, nom: o.nom, indices };
};

const suivantPresent = (
  ordre: string[],
  depuis: number,
  presents: Present[],
): number => {
  const ids = presents.map((j) => j.id);
  for (let pas = 0; pas < ordre.length; pas++) {
    const rang = (depuis + pas) % ordre.length;
    if (ids.includes(ordre[rang])) {
      return rang;
    }
  }
  return -1;
};

/** Une nouvelle manche commence par le choix de la catégorie, au joueur suivant. */
const versCategorie = (
  p: PartieIndices,
  numero: number,
  presents: Present[],
): PartieIndices => {
  const rang = suivantPresent(p.ordre, numero === 1 ? 0 : p.rang + 1, presents);
  const reste = p.restants.champion.length + p.restants.objet.length;
  if (numero > p.manches || presents.length < 2 || rang < 0 || reste === 0) {
    return { ...p, phase: "fin", choisit: null, restantMs: 0, trouve: [] };
  }
  return {
    ...p,
    phase: "categorie",
    manche: numero,
    rang,
    choisit: p.ordre[rang],
    enigme: null,
    revele: 0,
    trouve: [],
    restantMs: CATEGORIE_MS,
  };
};

const versManche = (
  p: PartieIndices,
  voulue: Categorie,
  presents: Present[],
  donnees: Donnees,
  hasard: Hasard,
): PartieIndices => {
  const categorie: Categorie =
    p.restants[voulue].length > 0
      ? voulue
      : voulue === "champion"
        ? "objet"
        : "champion";
  const { tires, restants } = tire(p.restants[categorie], 1, hasard);
  const enigme = tires[0]
    ? enigmeDe(categorie, tires[0], donnees, hasard)
    : null;
  const suite = {
    ...p,
    restants: { ...p.restants, [categorie]: restants },
  };
  if (!enigme) {
    return versCategorie(suite, p.manche + 1, presents);
  }
  return {
    ...suite,
    phase: "manche",
    choisit: null,
    enigme,
    revele: 1,
    devineurs: presents.map((j) => j.id),
    trouve: [],
    restantMs: p.duree * 1000,
  };
};

export const nouvellePartie = (
  presents: Present[],
  duree: number,
  manches: number,
  lang: string,
  donnees: Donnees,
): PartieIndices =>
  versCategorie(
    {
      phase: "categorie",
      lang,
      version: donnees.version,
      duree,
      manches,
      manche: 0,
      ordre: presents.map((j) => j.id),
      rang: 0,
      choisit: null,
      enigme: null,
      revele: 0,
      devineurs: [],
      trouve: [],
      scores: Object.fromEntries(presents.map((j) => [j.id, 0])),
      noms: Object.fromEntries(presents.map((j) => [j.id, j.name])),
      fil: [],
      restantMs: 0,
      restants: {
        champion: donnees.champions.map((c) => c.id),
        objet: donnees.objets.map((o) => o.id),
      },
    },
    1,
    presents,
  );

/** Le choix de la catégorie, par le seul joueur désigné. */
export const choisir = (
  p: PartieIndices,
  de: string,
  categorie: unknown,
  presents: Present[],
  donnees: Donnees,
  hasard: Hasard,
): PartieIndices =>
  p.phase === "categorie" &&
  de === p.choisit &&
  (categorie === "champion" || categorie === "objet")
    ? versManche(p, categorie, presents, donnees, hasard)
    : p;

const bilan = (p: PartieIndices): PartieIndices => ({
  ...p,
  phase: "bilan",
  revele: p.enigme?.indices.length ?? p.revele,
  restantMs: BILAN_MS,
});

export const deviner = (
  p: PartieIndices,
  joueur: string,
  texte: string,
): { partie: PartieIndices; proche: boolean } => {
  const propre = texte.trim().slice(0, 60);
  if (
    p.phase !== "manche" ||
    !p.enigme ||
    !propre ||
    !p.devineurs.includes(joueur) ||
    p.trouve.includes(joueur)
  ) {
    return { partie: p, proche: false };
  }
  const verdict = compare(propre, p.enigme.nom);
  if (verdict === "juste") {
    const gain = POINTS[Math.min(p.revele, POINTS.length) - 1] ?? 0;
    const suite: PartieIndices = {
      ...p,
      trouve: [...p.trouve, joueur],
      scores: { ...p.scores, [joueur]: (p.scores[joueur] ?? 0) + gain },
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

/** Le nombre d'indices visibles : un de plus à chaque part égale du chrono. */
export const visibles = (p: PartieIndices, restantMs: number): number => {
  const total = p.enigme?.indices.length ?? 0;
  if (p.phase !== "manche") {
    return total;
  }
  const ecoule = 1 - restantMs / (p.duree * 1000);
  return Math.min(total, 1 + Math.floor(ecoule * total));
};

export const avancer = (
  p: PartieIndices,
  ecouleMs: number,
  presents: Present[],
  donnees: Donnees,
  hasard: Hasard,
): PartieIndices => {
  if (p.phase === "fin") {
    return p;
  }
  const restantMs = Math.max(0, p.restantMs - ecouleMs);
  const suite = { ...p, restantMs };
  if (p.phase === "categorie") {
    return restantMs > 0
      ? suite
      : versManche(
          suite,
          hasard() < 0.5 ? "champion" : "objet",
          presents,
          donnees,
          hasard,
        );
  }
  if (p.phase === "manche") {
    return restantMs > 0
      ? { ...suite, revele: visibles(suite, restantMs) }
      : bilan(suite);
  }
  return restantMs > 0 ? suite : versCategorie(suite, p.manche + 1, presents);
};

/** Qui arrive joue dès la manche suivante ; si celui qui choisit part, le suivant choisit. */
export const presence = (
  p: PartieIndices,
  presents: Present[],
): PartieIndices => {
  const ids = presents.map((j) => j.id);
  const nouveaux = presents.filter((j) => !p.ordre.includes(j.id));
  const suite: PartieIndices = {
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
  if (p.phase === "categorie" && p.choisit && !ids.includes(p.choisit)) {
    const rang = suivantPresent(suite.ordre, p.rang + 1, presents);
    return rang < 0
      ? { ...suite, phase: "fin", choisit: null }
      : { ...suite, rang, choisit: suite.ordre[rang], restantMs: CATEGORIE_MS };
  }
  const tousTrouve = suite.devineurs.every((id) => suite.trouve.includes(id));
  return p.phase === "manche" && tousTrouve ? bilan(suite) : suite;
};

export const estPartieIndices = (data: unknown): data is PartieIndices => {
  const p = data as Partial<PartieIndices> | null;
  return (
    typeof p?.phase === "string" &&
    typeof p.manche === "number" &&
    Array.isArray(p.ordre) &&
    typeof p.scores === "object" &&
    typeof p.restantMs === "number"
  );
};
