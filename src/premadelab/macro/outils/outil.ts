import {
  MAP_BOUNDS,
  distance,
  type IconName,
  type MacroMapProps,
  type MacroShape,
  type MapPoint,
} from "../../../common";
import type { Camp, Element, Operation, Plan } from "../plan";

export type Menu = "mesure" | "dessin" | "icones";

export type CleOutil =
  | "mesure"
  | "feutre"
  | "fleche"
  | "rectangle"
  | "ellipse"
  | "gomme"
  | "icone";

/** Ce que l'utilisateur a réglé dans le panneau ; chaque outil y lit ce qui le concerne. */
export interface Reglages {
  encre: string;
  epaisseur: number;
  aimant: boolean;
  rayon: number;
  icone: string;
  camp: Camp | null;
  vision: boolean;
}

export interface Contexte {
  plan: Plan;
  reglages: Reglages;
  /** L'élément choisi : la mesure lue dans le panneau, l'icône que Suppr retire. */
  actif: string | null;
  unitesParPixel: number;
  reperes: readonly MapPoint[];
}

/** Ce qu'un geste produit en se terminant. actif absent : la sélection ne change pas. */
export interface Resultat {
  operations: Operation[];
  actif?: string | null;
}

/** Un geste en cours, du bouton enfoncé au bouton relâché. */
export interface Geste {
  bouge(point: MapPoint, ctx: Contexte): void;
  /** Ce que le geste posera, dessiné comme l'élément choisi. */
  apercu(ctx: Contexte): Element[];
  termine(point: MapPoint, ctx: Contexte): Resultat;
  /** Les éléments que l'aperçu remplace ou efface : la carte ne les dessine plus pendant le geste. */
  masques?: () => ReadonlySet<string>;
}

/**
 * Un outil du Macro Planner (Schub#168) : son menu, son bouton, et ce qu'il fait d'un geste. Il ne connaît ni la carte
 * ni le canal ; ajouter un outil, c'est écrire un fichier et l'inscrire au registre.
 */
export interface Outil {
  cle: CleOutil;
  menu: Menu;
  icone: IconName;
  curseur?: MacroMapProps["cursor"];
  /** La molette règle l'épaisseur du trait. */
  molette?: boolean;
  commence(point: MapPoint, ctx: Contexte): Geste | null;
}

/** Comment un type d'élément se dessine, et à quelle distance d'un point il se trouve (gomme, sélection). */
export interface Rendu<E extends Element> {
  dessine(element: E, ctx: ContexteRendu): MacroShape[];
  distance(element: E, point: MapPoint, unitesParPixel: number): number;
}

export interface ContexteRendu {
  actif: boolean;
  /** « 4 095 unités », dans la langue de la page. */
  unites: (valeur: number) => string;
  /** L'icône d'un champion, quand le catalogue de Data Dragon est chargé. */
  champion: (id: string) => string | null;
}

/** Tolérance d'un toucher, en pixels à l'écran. */
export const TOUCHER_PX = 10;

/** Un point gardé dans la carte : un élément hors des bornes serait refusé chez les autres. */
export const borne = (point: MapPoint): MapPoint => ({
  x: Math.min(MAP_BOUNDS.maxX, Math.max(MAP_BOUNDS.minX, Math.round(point.x))),
  y: Math.min(MAP_BOUNDS.maxY, Math.max(MAP_BOUNDS.minY, Math.round(point.y))),
});

/** Une épaisseur relative, en unités du jeu. */
export const enUnites = (epaisseur: number) =>
  epaisseur * (MAP_BOUNDS.maxX - MAP_BOUNDS.minX);

export const distanceAuSegment = (p: MapPoint, a: MapPoint, b: MapPoint) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const longueur = dx * dx + dy * dy;
  const t =
    longueur === 0
      ? 0
      : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / longueur));
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
};

/** Le repère le plus proche à moins de \`tolerance\` unités, sinon le point tel quel. */
export const aimante = (
  point: MapPoint,
  reperes: readonly MapPoint[],
  tolerance: number,
): MapPoint => {
  let meilleur: MapPoint | null = null;
  let ecart = tolerance;
  for (const repere of reperes) {
    const d = distance(point, repere);
    if (d <= ecart) {
      meilleur = repere;
      ecart = d;
    }
  }
  return meilleur ? { x: meilleur.x, y: meilleur.y } : point;
};
