import {
  MACRO_ICONS,
  distance,
  type MacroIconKey,
  type MacroShape,
} from "../../../common";
import { nouvelId, type ElementIcone } from "../plan";
import { borne, type Outil, type Rendu } from "./outil";

// La moitié d'une icône à l'écran : en deçà, le doigt est dessus.
const RAYON_PX = 16;
const SEUIL_GLISSER_PX = 4;
const CHAMPION = "champion:";

/** Le rayon de vision d'une balise, en unités du jeu. */
export const VISION: Readonly<Record<string, number>> = {
  ward: 900,
  controlWard: 900,
  farsight: 500,
};

export const estPictogramme = (cle: string): cle is MacroIconKey =>
  Object.prototype.hasOwnProperty.call(MACRO_ICONS, cle);

export const iconeDeChampion = (id: string) => `${CHAMPION}${id}`;

export const renduIcone: Rendu<ElementIcone> = {
  dessine: (icone, ctx) => {
    const formes: MacroShape[] = [];
    const vision = VISION[icone.icone];
    if (icone.vision && vision) {
      formes.push({
        kind: "range",
        center: icone.at,
        radius: vision,
        color: icone.camp ?? "neutral",
      });
    }
    if (icone.icone.startsWith(CHAMPION)) {
      const src = ctx.champion(icone.icone.slice(CHAMPION.length));
      formes.push(
        src
          ? {
              kind: "icon",
              at: icone.at,
              src,
              round: true,
              ring: icone.camp ?? "neutral",
            }
          : {
              kind: "point",
              at: icone.at,
              letter: icone.icone.charAt(CHAMPION.length),
              color: icone.camp ?? "neutral",
            },
      );
    } else if (estPictogramme(icone.icone)) {
      formes.push({ kind: "icon", at: icone.at, src: MACRO_ICONS[icone.icone] });
    }
    if (ctx.actif) {
      formes.push({ kind: "selection", at: icone.at });
    }
    return formes;
  },
  distance: (icone, point, unitesParPixel) =>
    Math.max(0, distance(icone.at, point) - RAYON_PX * unitesParPixel),
};

/**
 * Les icônes (Schub#170) : un clic pose l'icône choisie dans le panneau ; sur une icône, le doigt la choisit ou la
 * déplace.
 */
export const icones: Outil = {
  cle: "icone",
  menu: "icones",
  icone: "place",
  curseur: "pointer",
  commence(depart, ctx) {
    const sous = [...ctx.plan]
      .reverse()
      .find(
        (e): e is ElementIcone =>
          e.type === "icone" &&
          distance(e.at, depart) <= RAYON_PX * ctx.unitesParPixel,
      );
    if (sous) {
      let deplacee = sous;
      let glisse = false;
      return {
        bouge: (point) => {
          if (
            glisse ||
            distance(point, depart) >= SEUIL_GLISSER_PX * ctx.unitesParPixel
          ) {
            glisse = true;
            deplacee = {
              ...sous,
              at: borne({
                x: sous.at.x + point.x - depart.x,
                y: sous.at.y + point.y - depart.y,
              }),
            };
          }
        },
        apercu: () => (glisse ? [deplacee] : []),
        masques: () => new Set(glisse ? [sous.id] : []),
        termine: () => ({
          operations: glisse ? [{ t: "pose", e: deplacee }] : [],
          actif: sous.id,
        }),
      };
    }

    const id = nouvelId();
    const { icone, camp, vision } = ctx.reglages;
    let posee: ElementIcone = {
      id,
      type: "icone",
      icone,
      at: borne(depart),
      camp,
      vision,
    };
    return {
      bouge: (point) => {
        posee = { ...posee, at: borne(point) };
      },
      apercu: () => [posee],
      termine: (point) => ({
        operations: [{ t: "pose", e: { ...posee, at: borne(point) } }],
        actif: id,
      }),
    };
  },
};
