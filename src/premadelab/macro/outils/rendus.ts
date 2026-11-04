import type { MacroShape, MapPoint } from "../../../common";
import type { Element, Plan } from "../plan";
import { renduTrait } from "./feutre";
import { renduForme } from "./formes";
import { renduIcone } from "./icones";
import { renduMesure } from "./mesure";
import { TOUCHER_PX, type ContexteRendu } from "./outil";

export const dessineElement = (
  element: Element,
  ctx: ContexteRendu,
): MacroShape[] => {
  switch (element.type) {
    case "mesure":
      return renduMesure.dessine(element, ctx);
    case "trait":
      return renduTrait.dessine(element, ctx);
    case "forme":
      return renduForme.dessine(element, ctx);
    case "icone":
      return renduIcone.dessine(element, ctx);
  }
};

export const distanceElement = (
  element: Element,
  point: MapPoint,
  unitesParPixel: number,
): number => {
  switch (element.type) {
    case "mesure":
      return renduMesure.distance(element, point, unitesParPixel);
    case "trait":
      return renduTrait.distance(element, point, unitesParPixel);
    case "forme":
      return renduForme.distance(element, point, unitesParPixel);
    case "icone":
      return renduIcone.distance(element, point, unitesParPixel);
  }
};

/** L'élément sous le doigt, le plus proche ; à égalité, celui du dessus. */
export const elementSous = (
  plan: Plan,
  point: MapPoint,
  unitesParPixel: number,
  sauf: ReadonlySet<string> = new Set(),
): Element | null => {
  let trouve: Element | null = null;
  let ecart = TOUCHER_PX * unitesParPixel;
  for (const element of plan) {
    if (sauf.has(element.id)) {
      continue;
    }
    const d = distanceElement(element, point, unitesParPixel);
    if (d <= ecart) {
      trouve = element;
      ecart = d;
    }
  }
  return trouve;
};
