import { MAP_BOUNDS, type MapPoint } from "../../common";

// Le plan du Macro Planner (Schub#166) : une liste d'éléments, modifiée seulement par des opérations. Une opération
// pose un élément (le crée ou le remplace), en retire un, ou vide tout : rejouer deux fois les mêmes opérations donne
// le même plan. C'est ce qui permet de rejouer l'historique du relais sur un plan déjà enregistré.

export type Camp = "blue" | "red";

export interface ElementMesure {
  id: string;
  type: "mesure";
  a: MapPoint;
  b: MapPoint;
  /** Le rayon du cercle de portée autour de A, en unités du jeu. */
  r: number;
}

export interface ElementTrait {
  id: string;
  type: "trait";
  points: MapPoint[];
  encre: string;
  /** Relative à la largeur de la carte, comme `inkWidths`. */
  epaisseur: number;
}

export type FormeDessinee = "fleche" | "rectangle" | "ellipse";

export interface ElementForme {
  id: string;
  type: "forme";
  forme: FormeDessinee;
  a: MapPoint;
  b: MapPoint;
  encre: string;
  epaisseur: number;
}

export interface ElementIcone {
  id: string;
  type: "icone";
  /** Un pictogramme (`MacroIconKey`) ou `champion:<id Data Dragon>`. */
  icone: string;
  at: MapPoint;
  camp: Camp | null;
  /** Le rayon de vision d'une balise, tracé autour d'elle. */
  vision: boolean;
}

export type Element =
  ElementMesure | ElementTrait | ElementForme | ElementIcone;

export type Plan = readonly Element[];

export type Operation =
  /** rang : la place où remettre un élément retiré, pour qu'une annulation ne le fasse pas passer au-dessus. */
  | { t: "pose"; e: Element; rang?: number }
  | { t: "retire"; id: string }
  | { t: "vide" };

export const applique = (plan: Plan, operation: Operation): Plan => {
  switch (operation.t) {
    case "pose": {
      const rang = plan.findIndex((element) => element.id === operation.e.id);
      if (rang >= 0) {
        return plan.map((element, i) => (i === rang ? operation.e : element));
      }
      const place = Math.min(
        plan.length,
        Math.max(0, operation.rang ?? plan.length),
      );
      return [...plan.slice(0, place), operation.e, ...plan.slice(place)];
    }
    case "retire":
      return plan.filter((element) => element.id !== operation.id);
    case "vide":
      return [];
  }
};

export const appliqueTout = (plan: Plan, operations: readonly Operation[]) =>
  operations.reduce(applique, plan);

/** Les opérations qui défont `operations`, jouées sur `plan` : l'annulation d'un geste. */
export const inverse = (
  plan: Plan,
  operations: readonly Operation[],
): Operation[] => {
  const defaites: Operation[] = [];
  let courant = plan;
  for (const operation of operations) {
    const rangDe = (id: string) =>
      courant.findIndex((element) => element.id === id);
    switch (operation.t) {
      case "pose": {
        const rang = rangDe(operation.e.id);
        defaites.push(
          rang >= 0
            ? { t: "pose", e: courant[rang] }
            : { t: "retire", id: operation.e.id },
        );
        break;
      }
      case "retire": {
        const rang = rangDe(operation.id);
        if (rang >= 0) {
          defaites.push({ t: "pose", e: courant[rang], rang });
        }
        break;
      }
      case "vide":
        // Remis dans l'ordre une fois la liste retournée.
        defaites.push(
          ...courant
            .map((e, rang): Operation => ({ t: "pose", e, rang }))
            .reverse(),
        );
        break;
    }
    courant = applique(courant, operation);
  }
  return defaites.reverse();
};

export const nouvelId = () => {
  const octets = new Uint8Array(8);
  crypto.getRandomValues(octets);
  return Array.from(octets, (o) => o.toString(16).padStart(2, "0")).join("");
};

// Ce qui arrive d'ailleurs (un autre membre, le stockage du navigateur, le cœur) se relit avant d'entrer dans le plan.
const objet = (valeur: unknown): Record<string, unknown> | null =>
  typeof valeur === "object" && valeur !== null
    ? (valeur as Record<string, unknown>)
    : null;
const nombre = (valeur: unknown, min: number, max: number): valeur is number =>
  typeof valeur === "number" &&
  Number.isFinite(valeur) &&
  valeur >= min &&
  valeur <= max;
const point = (valeur: unknown): MapPoint | null => {
  const lu = objet(valeur);
  return lu &&
    nombre(lu.x, MAP_BOUNDS.minX, MAP_BOUNDS.maxX) &&
    nombre(lu.y, MAP_BOUNDS.minY, MAP_BOUNDS.maxY)
    ? { x: lu.x, y: lu.y }
    : null;
};
const id = (valeur: unknown): valeur is string =>
  typeof valeur === "string" && /^[A-Za-z0-9-]{1,40}$/.test(valeur);
const encre = (valeur: unknown): valeur is string =>
  typeof valeur === "string" && /^#[0-9A-Fa-f]{6}$/.test(valeur);
const POINTS_MAX = 2000;

export const lisElement = (valeur: unknown): Element | null => {
  const lu = objet(valeur);
  if (!lu || !id(lu.id)) {
    return null;
  }
  switch (lu.type) {
    case "mesure": {
      const a = point(lu.a);
      const b = point(lu.b);
      return a && b && nombre(lu.r, 1, 30000)
        ? { id: lu.id, type: "mesure", a, b, r: lu.r }
        : null;
    }
    case "trait": {
      const points = Array.isArray(lu.points)
        ? lu.points.slice(0, POINTS_MAX).map(point)
        : [];
      return points.length > 0 &&
        points.every((p) => p !== null) &&
        encre(lu.encre) &&
        nombre(lu.epaisseur, 0.0001, 0.1)
        ? {
            id: lu.id,
            type: "trait",
            points: points as MapPoint[],
            encre: lu.encre,
            epaisseur: lu.epaisseur,
          }
        : null;
    }
    case "forme": {
      const a = point(lu.a);
      const b = point(lu.b);
      return a &&
        b &&
        (lu.forme === "fleche" ||
          lu.forme === "rectangle" ||
          lu.forme === "ellipse") &&
        encre(lu.encre) &&
        nombre(lu.epaisseur, 0.0001, 0.1)
        ? {
            id: lu.id,
            type: "forme",
            forme: lu.forme,
            a,
            b,
            encre: lu.encre,
            epaisseur: lu.epaisseur,
          }
        : null;
    }
    case "icone": {
      const at = point(lu.at);
      return at &&
        typeof lu.icone === "string" &&
        /^(champion:)?[A-Za-z0-9]{1,40}$/.test(lu.icone) &&
        (lu.camp === null || lu.camp === "blue" || lu.camp === "red")
        ? {
            id: lu.id,
            type: "icone",
            icone: lu.icone,
            at,
            camp: lu.camp,
            vision: lu.vision === true,
          }
        : null;
    }
    default:
      return null;
  }
};

export const lisPlan = (valeur: unknown): Plan =>
  Array.isArray(valeur)
    ? valeur.map(lisElement).filter((e): e is Element => e !== null)
    : [];

export const lisOperation = (valeur: unknown): Operation | null => {
  const lu = objet(valeur);
  switch (lu?.t) {
    case "pose": {
      const e = lisElement(lu.e);
      return e
        ? {
            t: "pose",
            e,
            ...(nombre(lu.rang, 0, 1e6) ? { rang: lu.rang } : {}),
          }
        : null;
    }
    case "retire":
      return id(lu.id) ? { t: "retire", id: lu.id } : null;
    case "vide":
      return { t: "vide" };
    default:
      return null;
  }
};
