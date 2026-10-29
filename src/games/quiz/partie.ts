import { type Hasard, type Present, tire } from "../commun/devinette";
import type { Lang } from "../commun/textes";
import type { Vigilance } from "../commun/vigilance";
import { genere, type QuestionBanque, type Theme } from "./questions";

// Questions pour un invocateur (Schub#136) : un QCM à quatre choix. Une série de bonnes réponses rapporte plus que
// la vitesse (Schub#162). Chacun choisit le thème suivant parmi trois à tour de rôle, dans un ordre tiré au début.
// Le meneur garde la bonne réponse pour lui pendant la question (secret, retiré de ce qu'il diffuse) : elle n'est
// dans la page de personne avant le bilan.

export type Phase = "question" | "bilan" | "theme" | "fin";

export interface Solution {
  bonne: number;
  explication: string;
  source: string | null;
}

/**
 * vu (Schub#163) : le joueur a quitté le jeu pendant la question (sans bonus de rapidité) ou copié-collé (0 point).
 * Tout le monde le voit : 👀 à côté de son nom.
 */
export interface Reponse {
  choix: number;
  restantMs: number;
  vu: "absent" | "copie" | null;
}

export interface PartieQuiz {
  phase: Phase;
  lang: Lang;
  duree: number;
  manches: number;
  manche: number;
  themes: Theme[];
  theme: Theme | null;
  enonce: string;
  image: string | null;
  choix: string[];
  imagesChoix: string[][] | null;
  secret: Solution | null;
  /** La solution au bilan ; null si la question est annulée (le meneur est parti avec sa réponse). */
  solution: Solution | null;
  reponses: Record<string, Reponse>;
  joueursManche: string[];
  gains: Record<string, number>;
  choisit: string | null;
  proposes: Theme[];
  ordre: string[];
  rangChoix: number;
  scores: Record<string, number>;
  /** Les bonnes réponses d'affilée de chacun. */
  series: Record<string, number>;
  /** Au bilan, les séries d'au moins deux que la question vient de rompre. */
  rompues: Record<string, number>;
  noms: Record<string, string>;
  restantMs: number;
  posees: string[];
}

export const DUREES = [15, 20, 30];
export const DUREE_DEFAUT = 20;
export const MANCHES = [10, 15, 20];
export const MANCHES_DEFAUT = 15;
export const BILAN_MS = 7_000;
export const THEME_MS = 10_000;
const POINTS = 50;
const POINTS_RAPIDITE = 20;
const POINTS_SERIE = 15;
const POINTS_SERIE_MAX = 60;

/** Le bonus d'une bonne réponse qui porte la série à n : rien pour la première, puis +15 par réponse. */
const bonusSerie = (n: number) =>
  Math.min(POINTS_SERIE_MAX, POINTS_SERIE * Math.max(0, n - 1));

const versQuestion = (
  p: PartieQuiz,
  theme: Theme,
  numero: number,
  presents: Present[],
  banque: QuestionBanque[],
  hasard: Hasard,
): PartieQuiz => {
  const fin = { ...p, phase: "fin" as const, choisit: null, restantMs: 0 };
  if (numero > p.manches || presents.length < 2) {
    return fin;
  }
  // Un thème épuisé laisse la place aux autres, plutôt que d'arrêter la partie.
  const essais = [
    theme,
    ...tire(
      p.themes.filter((t) => t !== theme),
      p.themes.length,
      hasard,
    ).tires,
  ];
  for (const t of essais) {
    const q = genere(t, banque, p.lang, p.posees, hasard);
    if (q) {
      return {
        ...p,
        phase: "question",
        manche: numero,
        theme: t,
        enonce: q.enonce,
        image: q.image,
        choix: q.choix,
        imagesChoix: q.imagesChoix,
        secret: {
          bonne: q.bonne,
          explication: q.explication,
          source: q.source,
        },
        solution: null,
        reponses: {},
        joueursManche: presents.map((j) => j.id),
        gains: {},
        rompues: {},
        choisit: null,
        proposes: [],
        restantMs: p.duree * 1000,
        posees: [...p.posees, q.cle],
      };
    }
  }
  return fin;
};

export const nouvellePartie = (
  presents: Present[],
  themes: Theme[],
  duree: number,
  manches: number,
  lang: Lang,
  banque: QuestionBanque[],
  hasard: Hasard,
): PartieQuiz => {
  const base: PartieQuiz = {
    phase: "question",
    lang,
    duree,
    manches,
    manche: 0,
    themes,
    theme: null,
    enonce: "",
    image: null,
    choix: [],
    imagesChoix: null,
    secret: null,
    solution: null,
    reponses: {},
    joueursManche: [],
    gains: {},
    choisit: null,
    proposes: [],
    ordre: tire(presents, presents.length, hasard).tires.map((j) => j.id),
    rangChoix: -1,
    scores: Object.fromEntries(presents.map((j) => [j.id, 0])),
    series: {},
    rompues: {},
    noms: Object.fromEntries(presents.map((j) => [j.id, j.name])),
    restantMs: 0,
    posees: [],
  };
  const [theme] = tire(themes, 1, hasard).tires;
  return theme
    ? versQuestion(base, theme, 1, presents, banque, hasard)
    : { ...base, phase: "fin" };
};

/**
 * Une question annulée (le meneur est parti avec la réponse) ne compte pour personne, séries comprises. Sinon, qui
 * jouait la question et n'a pas trouvé (faux, pas de réponse, copier-coller) perd sa série.
 */
const bilan = (p: PartieQuiz): PartieQuiz => {
  const s = p.secret;
  const series = { ...p.series };
  const rompues: Record<string, number> = {};
  const gains: Record<string, number> = {};
  for (const id of s ? p.joueursManche : []) {
    const r = p.reponses[id];
    if (r && r.choix === s?.bonne && r.vu !== "copie") {
      series[id] = (series[id] ?? 0) + 1;
      const rapidite =
        r.vu === "absent"
          ? 0
          : Math.round(POINTS_RAPIDITE * (r.restantMs / (p.duree * 1000)));
      gains[id] = POINTS + rapidite + bonusSerie(series[id]);
    } else {
      if ((series[id] ?? 0) >= 2) {
        rompues[id] = series[id];
      }
      series[id] = 0;
    }
  }
  return {
    ...p,
    phase: "bilan",
    solution: s,
    secret: null,
    gains,
    series,
    rompues,
    scores: Object.fromEntries(
      Object.entries(p.scores).map(([id, n]) => [id, n + (gains[id] ?? 0)]),
    ),
    restantMs: BILAN_MS,
  };
};

/** Le joueur suivant dans l'ordre tiré au début de la partie. */
const choisisseur = (
  p: PartieQuiz,
  presents: Present[],
): { choisit: string | null; rangChoix: number } => {
  const ids = presents.map((j) => j.id);
  for (let pas = 1; pas <= p.ordre.length; pas++) {
    const rang = (p.rangChoix + pas + p.ordre.length) % p.ordre.length;
    if (ids.includes(p.ordre[rang])) {
      return { choisit: p.ordre[rang], rangChoix: rang };
    }
  }
  return { choisit: null, rangChoix: p.rangChoix };
};

const apresBilan = (
  p: PartieQuiz,
  presents: Present[],
  banque: QuestionBanque[],
  hasard: Hasard,
): PartieQuiz => {
  if (p.manche >= p.manches) {
    return { ...p, phase: "fin", restantMs: 0 };
  }
  if (p.themes.length <= 1) {
    return versQuestion(p, p.themes[0], p.manche + 1, presents, banque, hasard);
  }
  const { choisit, rangChoix } = choisisseur(p, presents);
  if (!choisit) {
    return { ...p, phase: "fin", restantMs: 0 };
  }
  return {
    ...p,
    phase: "theme",
    choisit,
    rangChoix,
    proposes: tire(p.themes, 3, hasard).tires,
    restantMs: THEME_MS,
  };
};

/** Une réponse envoyée au meneur : le choix et ce que le joueur a fait pendant la question. */
export interface Choix extends Vigilance {
  choix: number;
}

const estChoix = (valeur: unknown): valeur is Choix => {
  const c = valeur as Partial<Choix> | null;
  return (
    typeof c?.choix === "number" &&
    typeof c.absent === "boolean" &&
    typeof c.copie === "boolean"
  );
};

export const agir = (
  p: PartieQuiz,
  de: string,
  valeur: unknown,
  presents: Present[],
  banque: QuestionBanque[],
  hasard: Hasard,
): PartieQuiz => {
  if (p.phase === "question" && estChoix(valeur)) {
    if (
      !p.joueursManche.includes(de) ||
      de in p.reponses ||
      !Number.isInteger(valeur.choix) ||
      valeur.choix < 0 ||
      valeur.choix >= p.choix.length
    ) {
      return p;
    }
    const vu: Reponse["vu"] = valeur.copie
      ? "copie"
      : valeur.absent
        ? "absent"
        : null;
    const suite = {
      ...p,
      reponses: {
        ...p.reponses,
        [de]: { choix: valeur.choix, restantMs: p.restantMs, vu },
      },
    };
    const ids = presents.map((j) => j.id);
    const tous = suite.joueursManche
      .filter((id) => ids.includes(id))
      .every((id) => id in suite.reponses);
    return tous ? bilan(suite) : suite;
  }
  if (
    p.phase === "theme" &&
    de === p.choisit &&
    typeof valeur === "string" &&
    p.proposes.includes(valeur as Theme)
  ) {
    return versQuestion(
      p,
      valeur as Theme,
      p.manche + 1,
      presents,
      banque,
      hasard,
    );
  }
  return p;
};

export const avancer = (
  p: PartieQuiz,
  ecouleMs: number,
  presents: Present[],
  banque: QuestionBanque[],
  hasard: Hasard,
): PartieQuiz => {
  if (p.phase === "fin") {
    return p;
  }
  const restantMs = Math.max(0, p.restantMs - ecouleMs);
  const suite = { ...p, restantMs };
  if (restantMs > 0) {
    return suite;
  }
  switch (p.phase) {
    case "question":
      return bilan(suite);
    case "bilan":
      return apresBilan(suite, presents, banque, hasard);
    case "theme": {
      const [theme] = tire(p.proposes, 1, hasard).tires;
      return versQuestion(suite, theme, p.manche + 1, presents, banque, hasard);
    }
  }
};

/** Qui arrive répond dès la question suivante ; si celui qui choisit part, le thème est tiré au sort. */
export const presence = (p: PartieQuiz, presents: Present[]): PartieQuiz => {
  const ids = presents.map((j) => j.id);
  const nouveaux = presents.filter((j) => !p.ordre.includes(j.id));
  const suite: PartieQuiz = {
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
  };
  if (p.phase === "theme" && p.choisit && !ids.includes(p.choisit)) {
    return { ...suite, restantMs: 0 };
  }
  if (p.phase === "question") {
    const tous = p.joueursManche
      .filter((id) => ids.includes(id))
      .every((id) => id in p.reponses);
    return tous ? bilan(suite) : suite;
  }
  return suite;
};

/** Ce que le meneur diffuse : tout, sauf la bonne réponse tant que la question court. */
export const publique = (p: PartieQuiz): PartieQuiz =>
  p.phase === "question" ? { ...p, secret: null } : p;

export const estPartieQuiz = (data: unknown): data is PartieQuiz => {
  const p = data as Partial<PartieQuiz> | null;
  return (
    typeof p?.phase === "string" &&
    Array.isArray(p.choix) &&
    Array.isArray(p.ordre) &&
    typeof p.scores === "object" &&
    typeof p.series === "object" &&
    typeof p.restantMs === "number"
  );
};
