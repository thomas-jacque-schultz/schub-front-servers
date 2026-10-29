import { distance, type MapPoint } from "../../../common";
import { nouvelId, type Element, type ElementMesure } from "../plan";
import {
  TOUCHER_PX,
  aimante,
  distanceAuSegment,
  type Contexte,
  type Outil,
  type Rendu,
} from "./outil";

const AIMANT_PX = 14;
// En deçà, un toucher reste un toucher : il déplace A et garde B.
const SEUIL_GLISSER_PX = 4;
const LARGEUR = 0.0033;

export const estMesure = (element: Element): element is ElementMesure =>
  element.type === "mesure";

/** La mesure que lit le panneau : celle qu'on a choisie, sinon la dernière posée. */
export const mesureActive = (ctx: Pick<Contexte, "plan" | "actif">) => {
  const mesures = ctx.plan.filter(estMesure);
  return mesures.find((m) => m.id === ctx.actif) ?? mesures.at(-1) ?? null;
};

export const renduMesure: Rendu<ElementMesure> = {
  dessine: (m, ctx) => {
    const milieu = { x: (m.a.x + m.b.x) / 2, y: (m.a.y + m.b.y) / 2 };
    const longueur = ctx.unites(distance(m.a, m.b));
    if (!ctx.actif) {
      return [
        {
          kind: "line",
          from: m.a,
          to: m.b,
          color: "markSecondary",
          width: LARGEUR,
        },
        { kind: "label", at: milieu, text: longueur },
      ];
    }
    return [
      { kind: "range", center: m.a, radius: m.r, color: "mark" },
      { kind: "line", from: m.a, to: m.b, color: "mark", width: LARGEUR },
      { kind: "point", at: m.a, letter: "A", color: "mark" },
      { kind: "point", at: m.b, letter: "B", color: "markSecondary" },
      { kind: "label", at: milieu, text: longueur },
    ];
  },
  distance: (m, point) => distanceAuSegment(point, m.a, m.b),
};

/** La règle (Schub#168) : glisser trace une mesure, toucher déplace A, un bout de mesure se reprend au doigt. */
export const mesure: Outil = {
  cle: "mesure",
  menu: "mesure",
  icone: "ruler",
  commence(depart, ctx) {
    const place = (point: MapPoint) =>
      ctx.reglages.aimant
        ? aimante(point, ctx.reperes, AIMANT_PX * ctx.unitesParPixel)
        : point;
    const active = mesureActive(ctx);
    const tolerance = TOUCHER_PX * ctx.unitesParPixel;
    const mesures = ctx.plan.filter(estMesure);
    for (const m of active ? [active, ...mesures] : mesures) {
      for (const bout of ["a", "b"] as const) {
        if (distance(m[bout], depart) <= tolerance) {
          let reprise: ElementMesure = m;
          return {
            bouge: (point) => {
              reprise = { ...m, [bout]: place(point) };
            },
            apercu: () => [reprise],
            masques: () => new Set([m.id]),
            termine: (point) => ({
              operations: [{ t: "pose", e: { ...m, [bout]: place(point) } }],
              actif: m.id,
            }),
          };
        }
      }
    }

    const a = place(depart);
    let b = a;
    let glisse = false;
    return {
      bouge: (point) => {
        if (
          !glisse &&
          distance(point, depart) < SEUIL_GLISSER_PX * ctx.unitesParPixel
        ) {
          return;
        }
        glisse = true;
        b = place(point);
      },
      apercu: () =>
        glisse
          ? [{ id: "apercu", type: "mesure", a, b, r: ctx.reglages.rayon }]
          : [],
      termine: (point) => {
        if (!glisse) {
          return active
            ? {
                operations: [{ t: "pose", e: { ...active, a } }],
                actif: active.id,
              }
            : { operations: [] };
        }
        const id = nouvelId();
        return {
          operations: [
            {
              t: "pose",
              e: {
                id,
                type: "mesure",
                a,
                b: place(point),
                r: ctx.reglages.rayon,
              },
            },
          ],
          actif: id,
        };
      },
    };
  },
};
