import type { Champion } from "../commun/champions";
import type { Hasard, Present } from "../commun/devinette";
import { tire } from "../commun/devinette";
import TAILLES from "./tailles.json";

// La juste mesure (Schub#174) : un champion sert d'étalon, on donne à l'autre sa vraie taille à côté de lui. Tout le
// monde règle en même temps, et le bilan montre ce que chacun a répondu.

export type Phase = "manche" | "bilan" | "fin";

export interface Resultat {
  /** La hauteur choisie, en part de la scène. */
  choix: number;
  points: number;
}

export interface PartieMesure {
  phase: Phase;
  lang: string;
  duree: number;
  manches: number;
  manche: number;
  etalon: Champion | null;
  cible: Champion | null;
  /** D'où part le curseur : la même hauteur pour tous, loin de la bonne. */
  depart: number;
  joueurs: string[];
  choix: Record<string, number>;
  valides: string[];
  resultats: Record<string, Resultat>;
  scores: Record<string, number>;
  noms: Record<string, string>;
  restantMs: number;
  reserve: Champion[];
}

export const DUREES = [20, 30, 45];
export const DUREE_DEFAUT = 30;
export const MANCHES = [5, 10, 15];
export const MANCHES_DEFAUT = 5;
export const BILAN_MS = 8_000;

// L'étalon ne bouge jamais : sa hauteur à l'écran ne dit rien de la réponse.
export const HAUTEUR_ETALON = 0.33;
export const HAUTEUR_MIN = 0.08;
export const HAUTEUR_MAX = 1;
// Assez d'écart pour qu'il y ait quelque chose à juger, et une réponse qui tient dans la scène.
const RAPPORT_MIN = 1.15;
const JUSTE_MAX = 0.95;
const DEPART_ECART = 1.5;
// À ce facteur de la bonne taille, plus aucun point.
const FACTEUR_NUL = 1.75;
const POINTS = 100;

const hauteurDe = (champion: Champion) =>
  (TAILLES as Record<string, { hauteur: number }>)[champion.id]?.hauteur ?? 0;

export const estMesurable = (champion: Champion) => hauteurDe(champion) > 0;

/** La hauteur juste de la cible, en part de la scène : le monde réel, ramené à l'étalon. */
export const hauteurJuste = (etalon: Champion, cible: Champion) =>
  (HAUTEUR_ETALON * hauteurDe(cible)) / hauteurDe(etalon);

export const pointsDe = (choix: number, juste: number) =>
  Math.round(
    POINTS *
      Math.max(
        0,
        1 - Math.abs(Math.log(choix / juste)) / Math.log(FACTEUR_NUL),
      ),
  );

const jouable = (etalon: Champion, cible: Champion) => {
  const juste = hauteurJuste(etalon, cible);
  const rapport =
    Math.max(juste, HAUTEUR_ETALON) / Math.min(juste, HAUTEUR_ETALON);
  return (
    etalon.id !== cible.id &&
    rapport >= RAPPORT_MIN &&
    juste <= JUSTE_MAX &&
    juste >= HAUTEUR_MIN
  );
};

const departLoinDe = (juste: number, hasard: Hasard) => {
  const bornes = (min: number, max: number) => min + hasard() * (max - min);
  const dessous = juste / DEPART_ECART;
  const dessus = juste * DEPART_ECART;
  const peutDessous = dessous > HAUTEUR_MIN;
  const peutDessus = dessus < HAUTEUR_MAX;
  return peutDessous && (!peutDessus || hasard() < 0.5)
    ? bornes(HAUTEUR_MIN, dessous)
    : bornes(Math.min(dessus, HAUTEUR_MAX), HAUTEUR_MAX);
};

const lancerManche = (
  p: PartieMesure,
  numero: number,
  presents: Present[],
  hasard: Hasard,
): PartieMesure => {
  const fin: PartieMesure = { ...p, phase: "fin", restantMs: 0 };
  if (numero > p.manches || presents.length === 0) {
    return fin;
  }
  const { tires, restants } = tire(p.reserve, 1, hasard);
  const etalon = tires[0];
  const candidates = etalon ? restants.filter((c) => jouable(etalon, c)) : [];
  if (candidates.length === 0) {
    return fin;
  }
  const cible = tire(candidates, 1, hasard).tires[0];
  return {
    ...p,
    phase: "manche",
    manche: numero,
    etalon,
    cible,
    depart: departLoinDe(hauteurJuste(etalon, cible), hasard),
    joueurs: presents.map((j) => j.id),
    choix: {},
    valides: [],
    resultats: {},
    restantMs: p.duree * 1000,
    reserve: restants.filter((c) => c.id !== cible.id),
  };
};

export const nouvellePartie = (
  presents: Present[],
  duree: number,
  manches: number,
  lang: string,
  champions: Champion[],
  hasard: Hasard,
): PartieMesure =>
  lancerManche(
    {
      phase: "manche",
      lang,
      duree,
      manches,
      manche: 0,
      etalon: null,
      cible: null,
      depart: HAUTEUR_ETALON,
      joueurs: [],
      choix: {},
      valides: [],
      resultats: {},
      scores: Object.fromEntries(presents.map((j) => [j.id, 0])),
      noms: Object.fromEntries(presents.map((j) => [j.id, j.name])),
      restantMs: 0,
      reserve: champions.filter(estMesurable),
    },
    1,
    presents,
    hasard,
  );

// Qui n'a pas touché au curseur répond sa position de départ.
const bilan = (p: PartieMesure): PartieMesure => {
  if (!p.etalon || !p.cible) {
    return p;
  }
  const juste = hauteurJuste(p.etalon, p.cible);
  const resultats: Record<string, Resultat> = {};
  const scores = { ...p.scores };
  for (const id of p.joueurs) {
    const choix = p.choix[id] ?? p.depart;
    const points = pointsDe(choix, juste);
    resultats[id] = { choix, points };
    scores[id] = (scores[id] ?? 0) + points;
  }
  return { ...p, phase: "bilan", resultats, scores, restantMs: BILAN_MS };
};

export const avancer = (
  p: PartieMesure,
  ecouleMs: number,
  presents: Present[],
  hasard: Hasard,
): PartieMesure => {
  if (p.phase === "fin") {
    return p;
  }
  const restantMs = Math.max(0, p.restantMs - ecouleMs);
  const suite = { ...p, restantMs };
  if (restantMs > 0) {
    return suite;
  }
  return p.phase === "manche"
    ? bilan(suite)
    : lancerManche(suite, p.manche + 1, presents, hasard);
};

const estHauteur = (valeur: unknown): valeur is number =>
  typeof valeur === "number" && valeur >= HAUTEUR_MIN && valeur <= HAUTEUR_MAX;

/** Un réglage, à chaque curseur lâché, et la validation qui le fige : tout le monde a validé, la manche se clôt. */
export const action = (
  p: PartieMesure,
  de: string,
  valeur: unknown,
  parMeneur: boolean,
): PartieMesure => {
  const geste = valeur as {
    choix?: unknown;
    valide?: unknown;
    suite?: unknown;
  } | null;
  if (parMeneur && geste?.suite === true && p.phase === "bilan") {
    return { ...p, restantMs: 0 };
  }
  if (
    p.phase !== "manche" ||
    !p.joueurs.includes(de) ||
    p.valides.includes(de) ||
    !estHauteur(geste?.choix)
  ) {
    return p;
  }
  const valides = geste.valide === true ? [...p.valides, de] : p.valides;
  const suite = { ...p, choix: { ...p.choix, [de]: geste.choix }, valides };
  return p.joueurs.every((id) => valides.includes(id)) ? bilan(suite) : suite;
};

/** Qui arrive joue dès la manche suivante ; le départ du dernier qui réglait clôt la manche. */
export const presence = (
  p: PartieMesure,
  presents: Present[],
): PartieMesure => {
  const ids = presents.map((j) => j.id);
  const suite: PartieMesure = {
    ...p,
    scores: { ...Object.fromEntries(ids.map((id) => [id, 0])), ...p.scores },
    noms: {
      ...p.noms,
      ...Object.fromEntries(presents.map((j) => [j.id, j.name])),
    },
    joueurs: p.joueurs.filter((id) => ids.includes(id)),
  };
  return p.phase === "manche" &&
    suite.joueurs.every((id) => suite.valides.includes(id))
    ? bilan(suite)
    : suite;
};

export const estPartieMesure = (data: unknown): data is PartieMesure => {
  const p = data as Partial<PartieMesure> | null;
  return (
    typeof p?.phase === "string" &&
    typeof p.manche === "number" &&
    typeof p.depart === "number" &&
    typeof p.choix === "object" &&
    typeof p.resultats === "object" &&
    typeof p.scores === "object" &&
    typeof p.restantMs === "number"
  );
};
