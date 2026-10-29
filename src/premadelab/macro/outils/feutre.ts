import { distance, type MacroColor, type MapPoint } from "../../../common";
import { nouvelId, type ElementTrait } from "../plan";
import {
  borne,
  distanceAuSegment,
  enUnites,
  type Outil,
  type Rendu,
} from "./outil";

// Un trait passe par le relais en un message (32 Ko au plus) : un point tous les 3 pixels, 800 au plus.
const PAS_PX = 3;
const POINTS_MAX = 800;

export const renduTrait: Rendu<ElementTrait> = {
  dessine: (trait) => [
    {
      kind: "path",
      points: trait.points,
      color: trait.encre as MacroColor,
      width: trait.epaisseur,
    },
  ],
  distance: (trait, point) => {
    let plusPres = distance(point, trait.points[0]);
    for (let i = 1; i < trait.points.length; i++) {
      plusPres = Math.min(
        plusPres,
        distanceAuSegment(point, trait.points[i - 1], trait.points[i]),
      );
    }
    return Math.max(0, plusPres - enUnites(trait.epaisseur) / 2);
  },
};

/** Le feutre (Schub#169) : à main levée, l'épaisseur à la molette. */
export const feutre: Outil = {
  cle: "feutre",
  menu: "dessin",
  icone: "pen",
  molette: true,
  commence(depart, ctx) {
    const id = nouvelId();
    const points: MapPoint[] = [borne(depart)];
    const { encre, epaisseur } = ctx.reglages;
    const trait = (): ElementTrait => ({
      id,
      type: "trait",
      points: [...points],
      encre,
      epaisseur,
    });
    return {
      bouge: (point) => {
        if (
          points.length < POINTS_MAX &&
          distance(point, points[points.length - 1]) >=
            PAS_PX * ctx.unitesParPixel
        ) {
          points.push(borne(point));
        }
      },
      apercu: () => [trait()],
      termine: () => ({ operations: [{ t: "pose", e: trait() }] }),
    };
  },
};
