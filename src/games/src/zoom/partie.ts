import type { Champion } from "../commun/champions";
import {
  ajouteAuFil,
  compare,
  type Hasard,
  type Ligne,
  type Present,
  tire,
} from "../commun/devinette";

// Zoom : un splash art très zoomé sur un point, qui se dézoome au fil du chrono. Tout le monde devine en même
// temps ; plus on trouve tôt, plus on marque.

export type Phase = "manche" | "bilan" | "fin";

export interface PartieZoom {
  phase: Phase;
  lang: string;
  duree: number;
  manches: number;
  manche: number;
  champion: Champion | null;
  // Le point fixe du zoom, en part de la largeur et de la hauteur de l'image.
  foyer: { x: number; y: number };
  devineurs: string[];
  trouve: string[];
  scores: Record<string, number>;
  noms: Record<string, string>;
  fil: Ligne[];
  restantMs: number;
  reserve: Champion[];
}

export const DUREES = [20, 30, 45];
export const DUREE_DEFAUT = 30;
export const MANCHES = [5, 10, 15];
export const MANCHES_DEFAUT = 10;
export const BILAN_MS = 4_000;
const ZOOM_MAX = 8;
const POINTS = 30;
const POINTS_RAPIDITE = 70;

const lancerManche = (
  p: PartieZoom,
  numero: number,
  presents: Present[],
  hasard: Hasard,
): PartieZoom => {
  const { tires, restants } = tire(p.reserve, 1, hasard);
  if (numero > p.manches || presents.length < 2 || tires.length === 0) {
    return { ...p, phase: "fin", restantMs: 0, trouve: [] };
  }
  return {
    ...p,
    phase: "manche",
    manche: numero,
    champion: tires[0],
    foyer: { x: 0.25 + hasard() * 0.5, y: 0.2 + hasard() * 0.5 },
    devineurs: presents.map((j) => j.id),
    trouve: [],
    restantMs: p.duree * 1000,
    reserve: restants,
  };
};

export const nouvellePartie = (
  presents: Present[],
  duree: number,
  manches: number,
  lang: string,
  champions: Champion[],
  hasard: Hasard,
): PartieZoom =>
  lancerManche(
    {
      phase: "manche",
      lang,
      duree,
      manches,
      manche: 0,
      champion: null,
      foyer: { x: 0.5, y: 0.5 },
      devineurs: [],
      trouve: [],
      scores: Object.fromEntries(presents.map((j) => [j.id, 0])),
      noms: Object.fromEntries(presents.map((j) => [j.id, j.name])),
      fil: [],
      restantMs: 0,
      reserve: champions,
    },
    1,
    presents,
    hasard,
  );

const bilan = (p: PartieZoom): PartieZoom => ({
  ...p,
  phase: "bilan",
  restantMs: BILAN_MS,
});

export const deviner = (
  p: PartieZoom,
  joueur: string,
  texte: string,
): { partie: PartieZoom; proche: boolean } => {
  const propre = texte.trim().slice(0, 60);
  if (
    p.phase !== "manche" ||
    !p.champion ||
    !propre ||
    !p.devineurs.includes(joueur) ||
    p.trouve.includes(joueur)
  ) {
    return { partie: p, proche: false };
  }
  const verdict = compare(propre, p.champion.nom);
  if (verdict === "juste") {
    const gain =
      POINTS + Math.round(POINTS_RAPIDITE * (p.restantMs / (p.duree * 1000)));
    const suite: PartieZoom = {
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

export const avancer = (
  p: PartieZoom,
  ecouleMs: number,
  presents: Present[],
  hasard: Hasard,
): PartieZoom => {
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

/** Qui arrive devine dès la manche suivante ; le départ du dernier qui cherchait clôt la manche. */
export const presence = (p: PartieZoom, presents: Present[]): PartieZoom => {
  const ids = presents.map((j) => j.id);
  const suite: PartieZoom = {
    ...p,
    scores: {
      ...Object.fromEntries(ids.map((id) => [id, 0])),
      ...p.scores,
    },
    noms: {
      ...p.noms,
      ...Object.fromEntries(presents.map((j) => [j.id, j.name])),
    },
    devineurs: p.devineurs.filter((id) => ids.includes(id)),
  };
  const tousTrouve = suite.devineurs.every((id) => suite.trouve.includes(id));
  return p.phase === "manche" && tousTrouve ? bilan(suite) : suite;
};

/** Le grossissement à l'écran : très fort au début de la manche, l'image entière à la fin. */
export const grossissement = (p: PartieZoom, restantMs: number): number => {
  if (p.phase !== "manche") {
    return 1;
  }
  const part = Math.min(1, Math.max(0, restantMs / (p.duree * 1000)));
  return 1 + (ZOOM_MAX - 1) * part * part;
};

export const estPartieZoom = (data: unknown): data is PartieZoom => {
  const p = data as Partial<PartieZoom> | null;
  return (
    typeof p?.phase === "string" &&
    typeof p.manche === "number" &&
    typeof p.scores === "object" &&
    typeof p.restantMs === "number"
  );
};
