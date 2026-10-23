import {
  type Hasard,
  normalise,
  type Present,
  tire,
} from "../commun/devinette";

// In-vo-posteur (Schub#140) : tous ont le même champion, sauf l'imposteur qui en a un proche et ne le sait pas.
// Chacun dit un mot à son tour, trois tours, puis tout le monde vote. Le meneur diffuse les cartes de tous :
// chacun n'affiche que la sienne (triche acceptée entre amis, réponse du 21/10). Après le vote, plus de chrono
// (Schub#141) : l'imposteur devine sans limite, puis la manche suivante attend que tous soient prêts.

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
  /** Les joueurs de la manche, dans un ordre fixe : celui des cadres. */
  places: string[];
  /** L'ordre de parole du tour, retiré à chaque tour. */
  ordre: string[];
  tour: number;
  parle: number;
  cartes: Record<string, string>;
  champion: string;
  leurre: string;
  imposteur: string;
  /** Un mot vide : le joueur a passé, ou son chrono a expiré. */
  mots: Record<string, string[]>;
  votes: Record<string, string>;
  demasque: boolean;
  propositions: string[];
  chance: string | null;
  gains: Record<string, number>;
  annulee: boolean;
  prets: string[];
  scores: Record<string, number>;
  noms: Record<string, string>;
  restantMs: number;
  dejaImposteurs: string[];
  joues: string[];
}

export type Geste =
  | { mot: string }
  | { passe: true }
  | { vote: string }
  | { chance: string }
  | { pret: true }
  | { forcer: true };

export const MINIMUM = 3;
export const TOURS = 3;
export const MANCHES = [3, 5, 10];
export const MANCHES_DEFAUT = 5;
export const MOT_MS = 30_000;
export const VOTE_MS = 30_000;
export const PROPOSITIONS = 8;
export const POINT_DEMASQUE = 1;
export const POINTS_IMPOSTEUR = 3;
export const POINTS_CHANCE = 2;
const MOT_MAX = 24;

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

const idsDe = (presents: Present[]) => presents.map((j) => j.id);

const presentsDans = (places: string[], presents: Present[]) => {
  const ids = idsDe(presents);
  return places.filter((id) => ids.includes(id));
};

/** Un nouvel ordre de parole ; celui qui a parlé en dernier ne parle pas en premier. */
export const nouvelOrdre = (
  places: string[],
  dernier: string | null,
  hasard: Hasard,
): string[] => {
  const ordre = tire(places, places.length, hasard).tires;
  if (ordre.length > 1 && ordre[0] === dernier) {
    const [premier, ...reste] = ordre;
    const rang = 1 + Math.floor(hasard() * (reste.length - 1));
    return [...reste.slice(0, rang), premier, ...reste.slice(rang)];
  }
  return ordre;
};

const manche = (
  p: PartieImposteur,
  numero: number,
  presents: Present[],
  cartes: Carte[],
  hasard: Hasard,
): PartieImposteur => {
  const joueurs = idsDe(presents);
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
  const places = tire(joueurs, joueurs.length, hasard).tires;
  const leurres = tire(
    proches(champion, cartes).filter((c) => c.id !== leurre.id),
    PROPOSITIONS - 1,
    hasard,
  ).tires;
  const complement = tire(
    cartes.filter(
      (c) => c.id !== champion.id && c.id !== leurre.id && !leurres.includes(c),
    ),
    PROPOSITIONS - 1 - leurres.length,
    hasard,
  ).tires;
  return {
    ...p,
    phase: "mots",
    manche: numero,
    places,
    ordre: nouvelOrdre(places, null, hasard),
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
    demasque: false,
    propositions: tire(
      [champion, ...leurres, ...complement].map((c) => c.id),
      PROPOSITIONS,
      hasard,
    ).tires,
    chance: null,
    gains: {},
    annulee: false,
    prets: [],
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
      places: [],
      ordre: [],
      tour: 1,
      parle: 0,
      cartes: {},
      champion: "",
      leurre: "",
      imposteur: "",
      mots: {},
      votes: {},
      demasque: false,
      propositions: [],
      chance: null,
      gains: {},
      annulee: false,
      prets: [],
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

/** Le joueur suivant encore là ; après le dernier, le tour suivant dans un nouvel ordre, puis le vote. */
const auSuivant = (
  p: PartieImposteur,
  presents: Present[],
  hasard: Hasard,
): PartieImposteur => {
  const la = presentsDans(p.places, presents);
  let { tour, parle, ordre } = p;
  do {
    parle++;
    if (parle >= ordre.length) {
      tour++;
      parle = 0;
      ordre = nouvelOrdre(la, ordre[ordre.length - 1] ?? null, hasard);
    }
  } while (tour <= TOURS && !la.includes(ordre[parle]));
  return tour > TOURS
    ? { ...p, phase: "vote", tour: TOURS, parle: 0, restantMs: VOTE_MS }
    : { ...p, ordre, tour, parle, restantMs: MOT_MS };
};

const seche = (p: PartieImposteur, id: string): PartieImposteur => ({
  ...p,
  mots: { ...p.mots, [id]: [...(p.mots[id] ?? []), ""] },
});

/** Démasqué seulement s'il a strictement plus de voix que chacun des autres. */
export const estDemasque = (p: PartieImposteur): boolean => {
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

const depouille = (p: PartieImposteur): PartieImposteur => ({
  ...p,
  phase: "chance",
  demasque: estDemasque(p),
  restantMs: 0,
});

/** Démasqué : 1 point à chacun des autres ; sinon 3 à l'imposteur. Le champion trouvé lui vaut 2 de plus. */
export const bareme = (
  p: PartieImposteur,
  presents: Present[],
  trouve: boolean,
): Record<string, number> => {
  const gains: Record<string, number> = p.demasque
    ? Object.fromEntries(
        presentsDans(p.places, presents)
          .filter((id) => id !== p.imposteur)
          .map((id) => [id, POINT_DEMASQUE]),
      )
    : { [p.imposteur]: POINTS_IMPOSTEUR };
  if (trouve) {
    gains[p.imposteur] = (gains[p.imposteur] ?? 0) + POINTS_CHANCE;
  }
  return gains;
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
  prets: [],
  scores: Object.fromEntries(
    Object.entries(p.scores).map(([id, n]) => [id, n + (gains[id] ?? 0)]),
  ),
  restantMs: 0,
});

export const agir = (
  p: PartieImposteur,
  de: string,
  geste: unknown,
  presents: Present[],
  nomDe: (id: string) => string,
  hasard: Hasard,
  parMeneur = false,
): PartieImposteur => {
  const g = geste as Partial<
    Record<"mot" | "passe" | "vote" | "chance" | "pret" | "forcer", unknown>
  > | null;
  if (p.phase === "mots" && de === quiParle(p)) {
    if (typeof g?.mot === "string" && motValide(g.mot, nomDe(p.cartes[de]))) {
      const suite = {
        ...p,
        mots: { ...p.mots, [de]: [...(p.mots[de] ?? []), g.mot.trim()] },
      };
      return auSuivant(suite, presents, hasard);
    }
    if (g?.passe === true) {
      return auSuivant(seche(p, de), presents, hasard);
    }
    return p;
  }
  if (p.phase === "vote" && typeof g?.vote === "string") {
    if (
      !p.places.includes(de) ||
      !p.places.includes(g.vote) ||
      g.vote === de ||
      de in p.votes
    ) {
      return p;
    }
    const suite = { ...p, votes: { ...p.votes, [de]: g.vote } };
    return presentsDans(p.places, presents).every((id) => id in suite.votes)
      ? depouille(suite)
      : suite;
  }
  if (p.phase === "chance") {
    if (
      de === p.imposteur &&
      typeof g?.chance === "string" &&
      p.propositions.includes(g.chance)
    ) {
      return revelation(
        { ...p, chance: g.chance },
        bareme(p, presents, g.chance === p.champion),
      );
    }
    if (parMeneur && g?.forcer === true) {
      return revelation(p, bareme(p, presents, false));
    }
    return p;
  }
  if (p.phase === "revelation") {
    if (g?.pret === true && !p.prets.includes(de)) {
      return { ...p, prets: [...p.prets, de] };
    }
    if (parMeneur && g?.forcer === true) {
      return { ...p, prets: idsDe(presents) };
    }
  }
  return p;
};

/** Tous les présents sont prêts, y compris qui vient d'arriver ; qui est parti ne bloque personne. */
export const tousPrets = (p: PartieImposteur, presents: Present[]): boolean =>
  idsDe(presents).every((id) => p.prets.includes(id));

export const avancer = (
  p: PartieImposteur,
  ecouleMs: number,
  presents: Present[],
  cartes: Carte[],
  hasard: Hasard,
): PartieImposteur => {
  switch (p.phase) {
    case "fin":
    case "chance":
      return p;
    case "revelation":
      return tousPrets(p, presents)
        ? manche(p, p.manche + 1, presents, cartes, hasard)
        : p;
  }
  const restantMs = Math.max(0, p.restantMs - ecouleMs);
  const suite = { ...p, restantMs };
  if (restantMs > 0) {
    return suite;
  }
  if (p.phase === "mots") {
    const qui = quiParle(p);
    return auSuivant(qui ? seche(suite, qui) : suite, presents, hasard);
  }
  return depouille(suite);
};

/**
 * Qui arrive joue à la manche suivante. Qui part pendant les mots est sauté ; si c'est l'imposteur, la manche
 * est annulée, comme quand il ne reste plus assez de joueurs.
 */
export const presence = (
  p: PartieImposteur,
  presents: Present[],
): PartieImposteur => {
  const ids = idsDe(presents);
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
  const la = presentsDans(p.places, presents);
  if (!ids.includes(p.imposteur) || la.length < MINIMUM) {
    return revelation(suite, {}, true);
  }
  if (p.phase === "mots" && !ids.includes(quiParle(p) ?? "")) {
    return auSuivant(suite, presents, Math.random);
  }
  if (p.phase === "vote" && la.every((id) => id in p.votes)) {
    return depouille(suite);
  }
  return suite;
};

export const estPartieImposteur = (data: unknown): data is PartieImposteur => {
  const p = data as Partial<PartieImposteur> | null;
  return (
    typeof p?.phase === "string" &&
    Array.isArray(p.places) &&
    Array.isArray(p.ordre) &&
    Array.isArray(p.prets) &&
    typeof p.cartes === "object" &&
    typeof p.scores === "object" &&
    typeof p.restantMs === "number"
  );
};
