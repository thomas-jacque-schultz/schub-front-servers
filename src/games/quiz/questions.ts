import { type Hasard, tire } from "../commun/devinette";
import type { Lang } from "../commun/textes";

// Les questions de « Questions pour un invocateur » (Schub#136) viennent toutes de la banque (Schub#143) : celles
// écrites à la main et celles fabriquées depuis Data Dragon et Univers (fabrique.ts), que l'OWNER relit et corrige
// dans Schub. Le jeu ne fabrique plus rien pendant la partie.

export const THEMES = ["objets", "histoire", "skins", "monde", "pros"] as const;
export type Theme = (typeof THEMES)[number];

export interface Libelles {
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
  /** L'illustration de l'énoncé : l'icône d'un objet, le splash d'un skin. */
  image?: string | null;
  /** Une rangée d'icônes par choix, dans l'ordre des choix (les composants d'un objet). */
  imagesChoix?: string[][] | null;
  fr: Libelles;
  en: Libelles;
}

export interface Question {
  cle: string;
  theme: Theme;
  enonce: string;
  choix: string[];
  bonne: number;
  explication: string;
  source: string | null;
  image: string | null;
  imagesChoix: string[][] | null;
}

export const themesDisponibles = (banque: QuestionBanque[]): Theme[] =>
  THEMES.filter((theme) => banque.some((q) => q.theme === theme));

/** Une question du thème, jamais posée dans la partie ; null si le thème est épuisé. */
export const genere = (
  theme: Theme,
  banque: QuestionBanque[],
  lang: Lang,
  posees: string[],
  hasard: Hasard,
): Question | null => {
  const [q] = tire(
    banque.filter((b) => b.theme === theme && !posees.includes(b.id)),
    1,
    hasard,
  ).tires;
  if (!q) {
    return null;
  }
  const l = q[lang];
  const ordre = tire([0, 1, 2, 3], 4, hasard).tires;
  return {
    cle: q.id,
    theme,
    enonce: l.enonce,
    choix: ordre.map((i) => l.choix[i]),
    bonne: ordre.indexOf(0),
    explication: l.explication,
    source: q.source,
    image: q.image ?? null,
    imagesChoix: q.imagesChoix ? ordre.map((i) => q.imagesChoix![i]) : null,
  };
};
