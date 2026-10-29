import { distance, type IconName, type MacroColor } from "../../../common";
import { nouvelId, type ElementForme, type FormeDessinee } from "../plan";
import {
  borne,
  distanceAuSegment,
  enUnites,
  type Outil,
  type Rendu,
} from "./outil";

const MINIMUM_PX = 4;

export const renduForme: Rendu<ElementForme> = {
  dessine: (f) => {
    const color = f.encre as MacroColor;
    return f.forme === "fleche"
      ? [
          {
            kind: "line",
            from: f.a,
            to: f.b,
            color,
            width: f.epaisseur,
            arrow: true,
          },
        ]
      : [{ kind: f.forme, from: f.a, to: f.b, color, width: f.epaisseur }];
  },
  distance: (f, p) => {
    const demi = enUnites(f.epaisseur) / 2;
    if (f.forme === "fleche") {
      return Math.max(0, distanceAuSegment(p, f.a, f.b) - demi);
    }
    if (f.forme === "rectangle") {
      const coins = [f.a, { x: f.b.x, y: f.a.y }, f.b, { x: f.a.x, y: f.b.y }];
      const bord = Math.min(
        ...coins.map((coin, i) =>
          distanceAuSegment(p, coin, coins[(i + 1) % 4]),
        ),
      );
      return Math.max(0, bord - demi);
    }
    const centre = { x: (f.a.x + f.b.x) / 2, y: (f.a.y + f.b.y) / 2 };
    const rx = Math.max(1, Math.abs(f.b.x - f.a.x) / 2);
    const ry = Math.max(1, Math.abs(f.b.y - f.a.y) / 2);
    const relatif = Math.hypot((p.x - centre.x) / rx, (p.y - centre.y) / ry);
    return Math.max(0, Math.abs(relatif - 1) * Math.min(rx, ry) - demi);
  },
};

const outilDeForme = (forme: FormeDessinee, icone: IconName): Outil => ({
  cle: forme,
  menu: "dessin",
  icone,
  molette: true,
  commence(depart, ctx) {
    const id = nouvelId();
    const a = borne(depart);
    let b = a;
    const { encre, epaisseur } = ctx.reglages;
    const element = (): ElementForme => ({
      id,
      type: "forme",
      forme,
      a,
      b,
      encre,
      epaisseur,
    });
    return {
      bouge: (point) => {
        b = borne(point);
      },
      apercu: () => [element()],
      termine: (point) => {
        b = borne(point);
        return distance(a, b) < MINIMUM_PX * ctx.unitesParPixel
          ? { operations: [] }
          : { operations: [{ t: "pose", e: element() }] };
      },
    };
  },
});

/** Les formes (Schub#169) : la flèche se lit dans le sens du geste. */
export const fleche = outilDeForme("fleche", "arrow");
export const rectangle = outilDeForme("rectangle", "rectangle");
export const ellipse = outilDeForme("ellipse", "ellipse");
