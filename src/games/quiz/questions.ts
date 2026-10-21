import type { ChampionComplet, Donnees, Objet } from "../commun/ddragon";
import { type Hasard, normalise, tire } from "../commun/devinette";
import type { Lang } from "../commun/textes";
import type { Univers } from "../commun/univers";
import { texte } from "./textes";

// Les questions de « Questions pour un invocateur » (Schub#136). Objets, histoire, skins et monde sont tirés de
// Data Dragon et d'Univers : un champion ou un skin nouveau entre dans le jeu sans toucher au code. Les pros
// viennent d'une banque écrite à la main, chaque question datée et sourcée.

export const THEMES = ["objets", "histoire", "skins", "monde", "pros"] as const;
export type Theme = (typeof THEMES)[number];

export interface Question {
  cle: string;
  theme: Theme;
  enonce: string;
  choix: string[];
  bonne: number;
  explication: string;
  source: string | null;
}

interface Libelles {
  enonce: string;
  choix: string[];
  explication: string;
}

/** Une question de la banque : la bonne réponse est la première de choix, l'ordre est tiré à chaque partie. */
export interface QuestionBanque {
  id: string;
  theme: Theme;
  date: string;
  source: string;
  fr: Libelles;
  en: Libelles;
}

export interface Sources {
  donnees: Donnees;
  univers: Univers | null;
  banque: QuestionBanque[];
}

const MASQUE = "▢▢▢";
const HISTOIRE_MAX = 280;

export const themesDisponibles = (s: Sources): Theme[] =>
  THEMES.filter(
    (theme) =>
      (theme !== "monde" || s.univers !== null) &&
      (theme !== "pros" || s.banque.some((q) => q.theme === "pros")),
  );

const melange = (
  bonne: string,
  autres: string[],
  hasard: Hasard,
): { choix: string[]; bonne: number } => {
  const choix = tire([bonne, ...autres.slice(0, 3)], 4, hasard).tires;
  return { choix, bonne: choix.indexOf(bonne) };
};

const autresQue = <T>(
  liste: T[],
  exclus: (element: T) => boolean,
  n: number,
  hasard: Hasard,
) =>
  tire(
    liste.filter((element) => !exclus(element)),
    n,
    hasard,
  ).tires;

/** Des nombres voisins et distincts de la bonne réponse, jamais négatifs. */
const voisins = (n: number, pas: number, hasard: Hasard): number[] => {
  const candidats = [-3, -2, -1, 1, 2, 3, 4]
    .map((k) => n + k * pas)
    .filter((v) => v >= 0);
  return tire(candidats, 3, hasard).tires;
};

const prix = (lang: Lang, n: number) => texte(lang, "po", { n });

const questionObjet = (
  s: Sources,
  lang: Lang,
  hasard: Hasard,
): Question | null => {
  const avecComposants = s.donnees.objets.filter(
    (o) => o.composants.length >= 2,
  );
  if (hasard() < 0.5 && avecComposants.length >= 4) {
    const [o] = tire(avecComposants, 1, hasard).tires;
    const proches = (a: Objet) => Math.abs(a.prix - o.prix) <= 600;
    const autres = autresQue(
      avecComposants,
      (a) => a.id === o.id || !proches(a),
      3,
      hasard,
    );
    const m = melange(
      o.nom,
      autres.length === 3
        ? autres.map((a) => a.nom)
        : autresQue(avecComposants, (a) => a.id === o.id, 3, hasard).map(
            (a) => a.nom,
          ),
      hasard,
    );
    return {
      cle: `objet-composants-${o.id}`,
      theme: "objets",
      enonce: texte(lang, "objetComposants", {
        composants: o.composants.join(", "),
      }),
      ...m,
      explication: texte(lang, "objetExplication", {
        nom: o.nom,
        composants: o.composants.join(", "),
        prix: prix(lang, o.prix),
      }),
      source: null,
    };
  }
  const [o] = tire(
    s.donnees.objets.filter((a) => a.prix >= 300),
    1,
    hasard,
  ).tires;
  if (!o) {
    return null;
  }
  const m = melange(
    prix(lang, o.prix),
    voisins(o.prix, 100, hasard).map((n) => prix(lang, n)),
    hasard,
  );
  return {
    cle: `objet-prix-${o.id}`,
    theme: "objets",
    enonce: texte(lang, "objetPrix", { nom: o.nom }),
    ...m,
    explication: texte(lang, "objetPrixExplication", {
      nom: o.nom,
      prix: prix(lang, o.prix),
    }),
    source: null,
  };
};

/** L'histoire sans le nom du champion : chaque mot de son nom est masqué. */
export const masqueNom = (histoire: string, nom: string): string => {
  const mots = nom
    .split(/[\s']+/)
    .filter((mot) => mot.length >= 3)
    .map((mot) => mot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const masque = mots.reduce(
    (texteMasque, mot) =>
      texteMasque.replace(new RegExp(`\\b${mot}\\b`, "giu"), MASQUE),
    histoire,
  );
  if (masque.length <= HISTOIRE_MAX) {
    return masque;
  }
  const coupe = masque.slice(0, HISTOIRE_MAX);
  const point = coupe.lastIndexOf(". ");
  return point > 80 ? coupe.slice(0, point + 1) : `${coupe}…`;
};

const memeClasse = (a: ChampionComplet, b: ChampionComplet) =>
  a.classes[0] === b.classes[0];

const questionHistoire = (
  s: Sources,
  lang: Lang,
  hasard: Hasard,
): Question | null => {
  const [c] = tire(s.donnees.champions, 1, hasard).tires;
  if (!c) {
    return null;
  }
  const champions = s.donnees.champions;
  if (hasard() < 0.6 && c.histoire) {
    const pareils = autresQue(
      champions,
      (b) => b.id === c.id || !memeClasse(b, c),
      3,
      hasard,
    );
    const autres =
      pareils.length === 3
        ? pareils
        : autresQue(champions, (b) => b.id === c.id, 3, hasard);
    return {
      cle: `histoire-${c.id}`,
      theme: "histoire",
      enonce: texte(lang, "histoireQui", {
        extrait: masqueNom(c.histoire, c.nom),
      }),
      ...melange(
        c.nom,
        autres.map((b) => b.nom),
        hasard,
      ),
      explication: texte(lang, "histoireExplication", {
        nom: c.nom,
        titre: c.titre,
      }),
      source: null,
    };
  }
  const autres = autresQue(
    champions,
    (b) => b.id === c.id || !b.titre,
    3,
    hasard,
  );
  return {
    cle: `titre-${c.id}`,
    theme: "histoire",
    enonce: texte(lang, "titreDe", { nom: c.nom }),
    ...melange(
      c.titre,
      autres.map((b) => b.titre),
      hasard,
    ),
    explication: texte(lang, "histoireExplication", {
      nom: c.nom,
      titre: c.titre,
    }),
    source: null,
  };
};

const questionSkins = (
  s: Sources,
  lang: Lang,
  hasard: Hasard,
): Question | null => {
  const [c] = tire(
    s.donnees.champions.filter((b) => b.skins > 0),
    1,
    hasard,
  ).tires;
  if (!c) {
    return null;
  }
  return {
    cle: `skins-${c.id}`,
    theme: "skins",
    enonce: texte(lang, "skins", { nom: c.nom }),
    ...melange(
      String(c.skins),
      voisins(c.skins, 1, hasard).map(String),
      hasard,
    ),
    explication: texte(lang, "skinsExplication", {
      nom: c.nom,
      n: c.skins,
      version: s.donnees.version,
    }),
    source: null,
  };
};

const questionMonde = (
  s: Sources,
  lang: Lang,
  hasard: Hasard,
): Question | null => {
  const u = s.univers;
  if (!u) {
    return null;
  }
  const jouables = new Set(s.donnees.champions.map((c) => normalise(c.nom)));
  const champions = u.champions.filter((c) => jouables.has(c.cle));
  const situes = champions.filter((c) => c.region !== null);
  const region = (slug: string | null) =>
    slug ? (u.regions[slug] ?? slug) : "";
  const tirage = hasard();

  if (tirage < 0.4) {
    const [c] = tire(situes, 1, hasard).tires;
    if (!c) {
      return null;
    }
    const autres = autresQue(
      Object.keys(u.regions),
      (slug) => slug === c.region,
      3,
      hasard,
    );
    return {
      cle: `region-${c.cle}`,
      theme: "monde",
      enonce: texte(lang, "regionDe", { nom: c.nom }),
      ...melange(region(c.region), autres.map(region), hasard),
      explication: texte(lang, "regionExplication", {
        nom: c.nom,
        region: region(c.region),
      }),
      source: null,
    };
  }

  if (tirage < 0.7) {
    const [c] = tire(situes, 1, hasard).tires;
    if (!c) {
      return null;
    }
    const autres = autresQue(situes, (b) => b.region === c.region, 3, hasard);
    return {
      cle: `vient-de-${c.cle}`,
      theme: "monde",
      enonce: texte(lang, "vientDe", { region: region(c.region) }),
      ...melange(
        c.nom,
        autres.map((b) => b.nom),
        hasard,
      ),
      explication: texte(lang, "regionExplication", {
        nom: c.nom,
        region: region(c.region),
      }),
      source: null,
    };
  }

  const parAnnee = new Map<string, (typeof champions)[number]>();
  for (const c of tire(champions, champions.length, hasard).tires) {
    const annee = c.sortie.slice(0, 4);
    if (!parAnnee.has(annee)) {
      parAnnee.set(annee, c);
    }
  }
  const quatre = tire([...parAnnee.values()], 4, hasard).tires;
  if (quatre.length < 4) {
    return null;
  }
  const ranges = [...quatre].sort((a, b) => a.sortie.localeCompare(b.sortie));
  return {
    cle: `sortie-${ranges.map((c) => c.cle).join("-")}`,
    theme: "monde",
    enonce: texte(lang, "premierSorti"),
    ...melange(
      ranges[0].nom,
      ranges.slice(1).map((c) => c.nom),
      hasard,
    ),
    explication: ranges
      .map((c) => `${c.nom} (${c.sortie.slice(0, 4)})`)
      .join(", "),
    source: null,
  };
};

const questionBanque = (
  theme: Theme,
  s: Sources,
  lang: Lang,
  posees: string[],
  hasard: Hasard,
): Question | null => {
  const [q] = tire(
    s.banque.filter((b) => b.theme === theme && !posees.includes(b.id)),
    1,
    hasard,
  ).tires;
  if (!q) {
    return null;
  }
  const l = q[lang];
  return {
    cle: q.id,
    theme,
    enonce: l.enonce,
    ...melange(l.choix[0], l.choix.slice(1), hasard),
    explication: l.explication,
    source: q.source,
  };
};

const ESSAIS = 40;

/** Une question du thème, jamais posée dans la partie ; null si le thème est épuisé ou sans données. */
export const genere = (
  theme: Theme,
  s: Sources,
  lang: Lang,
  posees: string[],
  hasard: Hasard,
): Question | null => {
  // Les anecdotes du monde écrites à la main se mêlent aux questions tirées d'Univers.
  if (theme === "pros" || (theme === "monde" && hasard() < 0.3)) {
    const q = questionBanque(theme, s, lang, posees, hasard);
    if (q || theme === "pros") {
      return q;
    }
  }
  const fabrique = {
    objets: questionObjet,
    histoire: questionHistoire,
    skins: questionSkins,
    monde: questionMonde,
  }[theme];
  for (let essai = 0; essai < ESSAIS; essai++) {
    const q = fabrique(s, lang, hasard);
    if (q && !posees.includes(q.cle) && new Set(q.choix).size === 4) {
      return q;
    }
  }
  return null;
};
