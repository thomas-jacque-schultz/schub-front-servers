import { type Hasard, type Present, tire } from "../commun/devinette";
import type { Lang } from "../commun/textes";
import { genere, type QuestionBanque, type Theme } from "./questions";

// Questions pour un invocateur (Schub#136) : un QCM à quatre choix, plus on répond tôt plus on marque. Le plus
// rapide à avoir trouvé choisit le thème suivant parmi trois. Le meneur garde la bonne réponse pour lui pendant la
// question (secret, retiré de ce qu'il diffuse) : elle n'est dans la page de personne avant le bilan.

export type Phase = "question" | "bilan" | "theme" | "fin";

export interface Solution {
  bonne: number;
  explication: string;
  source: string | null;
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
  reponses: Record<string, { choix: number; restantMs: number }>;
  joueursManche: string[];
  gains: Record<string, number>;
  choisit: string | null;
  proposes: Theme[];
  ordre: string[];
  rangChoix: number;
  scores: Record<string, number>;
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
const POINTS = 30;
const POINTS_RAPIDITE = 70;

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
    ordre: presents.map((j) => j.id),
    rangChoix: -1,
    scores: Object.fromEntries(presents.map((j) => [j.id, 0])),
    noms: Object.fromEntries(presents.map((j) => [j.id, j.name])),
    restantMs: 0,
    posees: [],
  };
  const [theme] = tire(themes, 1, hasard).tires;
  return theme
    ? versQuestion(base, theme, 1, presents, banque, hasard)
    : { ...base, phase: "fin" };
};

const bilan = (p: PartieQuiz): PartieQuiz => {
  const s = p.secret;
  const gains = s
    ? Object.fromEntries(
        Object.entries(p.reponses)
          .filter(([, r]) => r.choix === s.bonne)
          .map(([id, r]) => [
            id,
            POINTS +
              Math.round(POINTS_RAPIDITE * (r.restantMs / (p.duree * 1000))),
          ]),
      )
    : {};
  return {
    ...p,
    phase: "bilan",
    solution: s,
    secret: null,
    gains,
    scores: Object.fromEntries(
      Object.entries(p.scores).map(([id, n]) => [id, n + (gains[id] ?? 0)]),
    ),
    restantMs: BILAN_MS,
  };
};

/** Le plus rapide à avoir trouvé ; sinon le joueur suivant dans l'ordre du salon. */
const choisisseur = (
  p: PartieQuiz,
  presents: Present[],
): { choisit: string | null; rangChoix: number } => {
  const ids = presents.map((j) => j.id);
  const gagnants = Object.keys(p.gains)
    .filter((id) => ids.includes(id))
    .sort((a, b) => p.reponses[b].restantMs - p.reponses[a].restantMs);
  if (gagnants[0]) {
    return { choisit: gagnants[0], rangChoix: p.ordre.indexOf(gagnants[0]) };
  }
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

export const agir = (
  p: PartieQuiz,
  de: string,
  valeur: unknown,
  presents: Present[],
  banque: QuestionBanque[],
  hasard: Hasard,
): PartieQuiz => {
  if (p.phase === "question" && typeof valeur === "number") {
    if (
      !p.joueursManche.includes(de) ||
      de in p.reponses ||
      !Number.isInteger(valeur) ||
      valeur < 0 ||
      valeur >= p.choix.length
    ) {
      return p;
    }
    const suite = {
      ...p,
      reponses: {
        ...p.reponses,
        [de]: { choix: valeur, restantMs: p.restantMs },
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
    typeof p.restantMs === "number"
  );
};
