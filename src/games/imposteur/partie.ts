import {
  type Hasard,
  normalise,
  type Present,
  tire,
} from "../commun/devinette";

// In-vo-posteur (Schub#140) : tous ont le même champion, sauf l'imposteur qui en a un proche et ne le sait pas.
// Chacun dit un mot à son tour, trois tours, puis tout le monde vote. Le meneur diffuse les cartes de tous :
// chacun n'affiche que la sienne (triche acceptée entre amis, réponse du 21/10).

export type Phase = "mots" | "vote" | "chance" | "revelation" | "fin";

export interface Carte {
  id: string;
  nom: string;
  /** Les classes de Data Dragon et la région d'Univers : deux champions proches en partagent une. */
  classes: string[];
  region: string | null;
}

export interface PartieImposteur {
  phase: Phase;
  lang: string;
  manches: number;
  manche: number;
  ordre: string[];
  tour: number;
  parle: number;
  cartes: Record<string, string>;
  champion: string;
  leurre: string;
  imposteur: string;
  mots: Record<string, string[]>;
  votes: Record<string, string>;
  propositions: string[];
  chance: string | null;
  gains: Record<string, number>;
  annulee: boolean;
  scores: Record<string, number>;
  noms: Record<string, string>;
  restantMs: number;
  dejaImposteurs: string[];
  joues: string[];
}

export type Geste = { mot: string } | { vote: string } | { chance: string };

export const MINIMUM = 3;
export const TOURS = 3;
export const MANCHES = [3, 5, 10];
export const MANCHES_DEFAUT = 5;
export const MOT_MS = 30_000;
export const VOTE_MS = 30_000;
export const CHANCE_MS = 20_000;
export const REVELATION_MS = 8_000;
const MOT_MAX = 24;
const POINT_DEMASQUE = 1;
const POINTS_IMPOSTEUR = 3;
const POINTS_CHANCE = 2;

/** Même classe principale, ou même région : sinon l'imposteur se trahirait dès son premier mot. */
export const proches = (a: Carte, cartes: Carte[]): Carte[] =>
  cartes.filter(
    (b) =>
      b.id !== a.id &&
      (b.classes[0] === a.classes[0] ||
        (a.region !== null && b.region === a.region)),
  );

/** Un seul mot, sans le nom de sa carte (accents et majuscules ignorés, comme au scribble). */
export const motValide = (mot: string, nomDeLaCarte: string): boolean => {
  const propre = mot.trim();
  return (
    propre.length > 0 &&
    propre.length <= MOT_MAX &&
    !/\s/.test(propre) &&
    normalise(propre).length > 0 &&
    !normalise(propre).includes(normalise(nomDeLaCarte))
  );
};

const presentsDans = (ordre: string[], presents: Present[]) => {
  const ids = presents.map((j) => j.id);
  return ordre.filter((id) => ids.includes(id));
};

const manche = (
  p: PartieImposteur,
  numero: number,
  presents: Present[],
  cartes: Carte[],
  hasard: Hasard,
): PartieImposteur => {
  const joueurs = presents.map((j) => j.id);
  const libres = cartes.filter((c) => !p.joues.includes(c.id));
  const { tires } = tire(libres.length > 0 ? libres : cartes, 1, hasard);
  const champion = tires[0];
  const voisins = champion ? proches(champion, cartes) : [];
  const leurre = tire(voisins, 1, hasard).tires[0];
  if (numero > p.manches || joueurs.length < MINIMUM || !champion || !leurre) {
    return { ...p, phase: "fin", restantMs: 0 };
  }
  const candidats = joueurs.filter((id) => !p.dejaImposteurs.includes(id));
  const imposteur = tire(candidats.length > 0 ? candidats : joueurs, 1, hasard)
    .tires[0];
  const ordre = tire(joueurs, joueurs.length, hasard).tires;
  const leurres = tire(
    proches(champion, cartes).filter((c) => c.id !== leurre.id),
    3,
    hasard,
  ).tires;
  const complement = tire(
    cartes.filter(
      (c) => c.id !== champion.id && c.id !== leurre.id && !leurres.includes(c),
    ),
    3 - leurres.length,
    hasard,
  ).tires;
  return {
    ...p,
    phase: "mots",
    manche: numero,
    ordre,
    tour: 1,
    parle: 0,
    cartes: Object.fromEntries(
      joueurs.map((id) => [id, id === imposteur ? leurre.id : champion.id]),
    ),
    champion: champion.id,
    leurre: leurre.id,
    imposteur,
    mots: Object.fromEntries(joueurs.map((id) => [id, []])),
    votes: {},
    propositions: tire(
      [champion, ...leurres, ...complement].map((c) => c.id),
      4,
      hasard,
    ).tires,
    chance: null,
    gains: {},
    annulee: false,
    restantMs: MOT_MS,
    dejaImposteurs:
      candidats.length > 0 ? [...p.dejaImposteurs, imposteur] : [imposteur],
    joues: [...p.joues, champion.id, leurre.id],
  };
};

export const nouvellePartie = (
  presents: Present[],
  manches: number,
  lang: string,
  cartes: Carte[],
  hasard: Hasard,
): PartieImposteur =>
  manche(
    {
      phase: "mots",
      lang,
      manches,
      manche: 0,
      ordre: [],
      tour: 1,
      parle: 0,
      cartes: {},
      champion: "",
      leurre: "",
      imposteur: "",
      mots: {},
      votes: {},
      propositions: [],
      chance: null,
      gains: {},
      annulee: false,
      scores: Object.fromEntries(presents.map((j) => [j.id, 0])),
      noms: Object.fromEntries(presents.map((j) => [j.id, j.name])),
      restantMs: 0,
      dejaImposteurs: [],
      joues: [],
    },
    1,
    presents,
    cartes,
    hasard,
  );

export const quiParle = (p: PartieImposteur): string | null =>
  p.phase === "mots" ? (p.ordre[p.parle] ?? null) : null;

/** Le joueur suivant encore là ; après le dernier, le tour suivant, puis le vote. */
const auSuivant = (
  p: PartieImposteur,
  presents: Present[],
): PartieImposteur => {
  const la = presentsDans(p.ordre, presents);
  let { tour, parle } = p;
  do {
    parle++;
    if (parle >= p.ordre.length) {
      tour++;
      parle = 0;
    }
  } while (tour <= TOURS && !la.includes(p.ordre[parle]));
  return tour > TOURS
    ? { ...p, phase: "vote", tour: TOURS, parle: 0, restantMs: VOTE_MS }
    : { ...p, tour, parle, restantMs: MOT_MS };
};

const revelation = (
  p: PartieImposteur,
  gains: Record<string, number>,
  annulee = false,
): PartieImposteur => ({
  ...p,
  phase: "revelation",
  gains,
  annulee,
  scores: Object.fromEntries(
    Object.entries({ ...p.scores }).map(([id, n]) => [
      id,
      n + (gains[id] ?? 0),
    ]),
  ),
  restantMs: REVELATION_MS,
});

/** Démasqué seulement s'il a strictement plus de voix que chacun des autres. */
export const demasque = (p: PartieImposteur): boolean => {
  const voix: Record<string, number> = {};
  for (const cible of Object.values(p.votes)) {
    voix[cible] = (voix[cible] ?? 0) + 1;
  }
  const siennes = voix[p.imposteur] ?? 0;
  return (
    siennes > 0 &&
    Object.entries(voix).every(([id, n]) => id === p.imposteur || n < siennes)
  );
};

const depouille = (
  p: PartieImposteur,
  presents: Present[],
): PartieImposteur => {
  const la = presentsDans(p.ordre, presents);
  if (demasque(p)) {
    return {
      ...p,
      phase: "chance",
      gains: Object.fromEntries(
        la.filter((id) => id !== p.imposteur).map((id) => [id, POINT_DEMASQUE]),
      ),
      restantMs: CHANCE_MS,
    };
  }
  return revelation(p, { [p.imposteur]: POINTS_IMPOSTEUR });
};

export const agir = (
  p: PartieImposteur,
  de: string,
  geste: unknown,
  presents: Present[],
  nomDe: (id: string) => string,
): PartieImposteur => {
  const g = geste as Partial<Record<"mot" | "vote" | "chance", unknown>> | null;
  if (p.phase === "mots" && typeof g?.mot === "string") {
    if (de !== quiParle(p) || !motValide(g.mot, nomDe(p.cartes[de]))) {
      return p;
    }
    const suite = {
      ...p,
      mots: { ...p.mots, [de]: [...(p.mots[de] ?? []), g.mot.trim()] },
    };
    return auSuivant(suite, presents);
  }
  if (p.phase === "vote" && typeof g?.vote === "string") {
    if (
      !p.ordre.includes(de) ||
      !p.ordre.includes(g.vote) ||
      g.vote === de ||
      de in p.votes
    ) {
      return p;
    }
    const suite = { ...p, votes: { ...p.votes, [de]: g.vote } };
    const la = presentsDans(p.ordre, presents);
    return la.every((id) => id in suite.votes)
      ? depouille(suite, presents)
      : suite;
  }
  if (p.phase === "chance" && typeof g?.chance === "string") {
    if (de !== p.imposteur || !p.propositions.includes(g.chance)) {
      return p;
    }
    const trouve = g.chance === p.champion;
    return revelation(
      { ...p, chance: g.chance },
      trouve ? { ...p.gains, [p.imposteur]: POINTS_CHANCE } : p.gains,
    );
  }
  return p;
};

export const avancer = (
  p: PartieImposteur,
  ecouleMs: number,
  presents: Present[],
  cartes: Carte[],
  hasard: Hasard,
): PartieImposteur => {
  if (p.phase === "fin") {
    return p;
  }
  const restantMs = Math.max(0, p.restantMs - ecouleMs);
  const suite = { ...p, restantMs };
  if (restantMs > 0) {
    return suite;
  }
  switch (p.phase) {
    case "mots":
      return auSuivant(suite, presents);
    case "vote":
      return depouille(suite, presents);
    case "chance":
      return revelation(suite, p.gains);
    case "revelation":
      return manche(suite, p.manche + 1, presents, cartes, hasard);
  }
};

/**
 * Qui arrive joue à la manche suivante. Qui part pendant les mots est sauté ; si c'est l'imposteur, la manche
 * est annulée, comme quand il ne reste plus assez de joueurs.
 */
export const presence = (
  p: PartieImposteur,
  presents: Present[],
): PartieImposteur => {
  const ids = presents.map((j) => j.id);
  const suite: PartieImposteur = {
    ...p,
    scores: {
      ...Object.fromEntries(ids.map((id) => [id, 0])),
      ...p.scores,
    },
    noms: {
      ...p.noms,
      ...Object.fromEntries(presents.map((j) => [j.id, j.name])),
    },
  };
  if (p.phase !== "mots" && p.phase !== "vote" && p.phase !== "chance") {
    return suite;
  }
  const la = presentsDans(p.ordre, presents);
  if (!ids.includes(p.imposteur) || la.length < MINIMUM) {
    return revelation(suite, {}, true);
  }
  if (p.phase === "mots" && !ids.includes(quiParle(p) ?? "")) {
    return auSuivant(suite, presents);
  }
  if (p.phase === "vote" && la.every((id) => id in p.votes)) {
    return depouille(suite, presents);
  }
  return suite;
};

export const estPartieImposteur = (data: unknown): data is PartieImposteur => {
  const p = data as Partial<PartieImposteur> | null;
  return (
    typeof p?.phase === "string" &&
    Array.isArray(p.ordre) &&
    typeof p.cartes === "object" &&
    typeof p.scores === "object" &&
    typeof p.restantMs === "number"
  );
};
