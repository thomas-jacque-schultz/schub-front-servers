import type { MapPoint } from "../../../common";
import type { Outil } from "./outil";
import { elementSous } from "./rendus";

/** La gomme (Schub#169) : elle retire un élément entier, que Ctrl + Z remet. Glisser en retire plusieurs. */
export const gomme: Outil = {
  cle: "gomme",
  menu: "dessin",
  icone: "eraser",
  curseur: "cell",
  commence(depart, ctx) {
    const effaces = new Set<string>();
    const touche = (point: MapPoint) => {
      const element = elementSous(ctx.plan, point, ctx.unitesParPixel, effaces);
      if (element) {
        effaces.add(element.id);
      }
    };
    touche(depart);
    return {
      bouge: touche,
      apercu: () => [],
      masques: () => effaces,
      termine: (point) => {
        touche(point);
        return {
          operations: [...effaces].map((id) => ({ t: "retire", id })),
          actif: ctx.actif && effaces.has(ctx.actif) ? null : undefined,
        };
      },
    };
  },
};
