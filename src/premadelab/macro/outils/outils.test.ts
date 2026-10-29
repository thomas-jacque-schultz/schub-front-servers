import { describe, expect, it } from "vitest";
import type { MapPoint } from "../../../common";
import { appliqueTout, type Element, type Plan } from "../plan";
import { feutre } from "./feutre";
import { fleche } from "./formes";
import { gomme } from "./gomme";
import { icones } from "./icones";
import { mesure } from "./mesure";
import type { Contexte, Outil } from "./outil";

// Une carte de 760 pixels : environ 20 unités par pixel.
const UPP = 20;

const contexte = (plan: Plan, actif: string | null = null): Contexte => ({
  plan,
  actif,
  unitesParPixel: UPP,
  reperes: [{ x: 5000, y: 5000 }],
  reglages: {
    encre: "#5B9BE8",
    epaisseur: 0.006,
    aimant: true,
    rayon: 1000,
    icone: "ward",
    camp: null,
    vision: true,
  },
});

const geste = (outil: Outil, ctx: Contexte, ...points: MapPoint[]) => {
  const enCours = outil.commence(points[0], ctx);
  if (!enCours) {
    return { operations: [] };
  }
  for (const point of points.slice(1)) {
    enCours.bouge(point, ctx);
  }
  return enCours.termine(points[points.length - 1], ctx);
};

const uneMesure: Element = {
  id: "m",
  type: "mesure",
  a: { x: 1000, y: 1000 },
  b: { x: 3000, y: 1000 },
  r: 550,
};

describe("les outils du Macro Planner", () => {
  it("la règle trace une mesure aimantée en glissant, et la choisit", () => {
    const ctx = contexte([]);
    const fait = geste(mesure, ctx, { x: 5100, y: 5100 }, { x: 8000, y: 8000 });
    const plan = appliqueTout([], fait.operations);
    expect(plan).toMatchObject([
      {
        type: "mesure",
        a: { x: 5000, y: 5000 },
        b: { x: 8000, y: 8000 },
        r: 1000,
      },
    ]);
    expect(fait.actif).toBe(plan[0].id);
  });

  it("un toucher sans glisser déplace A de la mesure choisie et garde B", () => {
    const fait = geste(mesure, contexte([uneMesure], "m"), {
      x: 9000,
      y: 9000,
    });
    expect(appliqueTout([uneMesure], fait.operations)).toEqual([
      { ...uneMesure, a: { x: 9000, y: 9000 } },
    ]);
  });

  it("un bout de mesure se reprend au doigt", () => {
    const fait = geste(
      mesure,
      contexte([uneMesure], "m"),
      { x: 3050, y: 1000 },
      { x: 3500, y: 2000 },
    );
    expect(appliqueTout([uneMesure], fait.operations)).toEqual([
      { ...uneMesure, b: { x: 3500, y: 2000 } },
    ]);
  });

  it("la gomme retire l'élément touché, entier", () => {
    const fait = geste(gomme, contexte([uneMesure]), { x: 2000, y: 1100 });
    expect(fait.operations).toEqual([{ t: "retire", id: "m" }]);
    expect(
      geste(gomme, contexte([uneMesure]), { x: 2000, y: 4000 }).operations,
    ).toEqual([]);
  });

  it("une icône posée se déplace en la glissant, sans en créer une autre", () => {
    const posee = appliqueTout(
      [],
      geste(icones, contexte([]), { x: 6000, y: 6000 }).operations,
    );
    expect(posee).toMatchObject([
      { type: "icone", icone: "ward", vision: true },
    ]);
    const deplacee = geste(
      icones,
      contexte(posee),
      { x: 6100, y: 6000 },
      { x: 7100, y: 6500 },
    );
    expect(appliqueTout(posee, deplacee.operations)).toEqual([
      { ...posee[0], at: { x: 7000, y: 6500 } },
    ]);
  });

  it("la flèche va du début du geste à sa fin ; un trait trop court n'est rien", () => {
    const fait = geste(
      fleche,
      contexte([]),
      { x: 1000, y: 1000 },
      { x: 4000, y: 2000 },
    );
    expect(appliqueTout([], fait.operations)).toMatchObject([
      {
        type: "forme",
        forme: "fleche",
        a: { x: 1000, y: 1000 },
        b: { x: 4000, y: 2000 },
      },
    ]);
    expect(
      geste(fleche, contexte([]), { x: 1000, y: 1000 }, { x: 1010, y: 1000 })
        .operations,
    ).toEqual([]);
  });

  it("le feutre garde un point tous les quelques pixels", () => {
    const points = Array.from({ length: 50 }, (_, i) => ({
      x: 1000 + i * 10,
      y: 1000,
    }));
    const [trait] = appliqueTout(
      [],
      geste(feutre, contexte([]), ...points).operations,
    );
    expect(trait.type === "trait" && trait.points.length).toBeLessThan(10);
  });
});
