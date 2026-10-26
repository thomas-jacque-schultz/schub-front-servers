import { describe, expect, it } from "vitest";
import {
  distance,
  MAP_SIZE,
  mirror,
  snapTo,
  toScreen,
  toWorld,
} from "./mapRuler";

describe("la géométrie de la règle", () => {
  it("place l'origine en bas à gauche, y vers le haut", () => {
    expect(toScreen({ x: 0, y: 0 }, 500)).toEqual({ x: 0, y: 500 });
    expect(toScreen({ x: MAP_SIZE, y: MAP_SIZE }, 500)).toEqual({
      x: 500,
      y: 0,
    });
  });

  it("revient au même point du monde après un aller-retour par l'écran", () => {
    const point = { x: 5007, y: 10471 };
    const retour = toWorld(toScreen(point, 745), 745);
    expect(retour.x).toBeCloseTo(point.x);
    expect(retour.y).toBeCloseTo(point.y);
  });

  it("garde un point tiré hors du canvas sur la carte", () => {
    expect(toWorld({ x: -20, y: 900 }, 800)).toEqual({ x: 0, y: 0 });
  });

  it("mesure en unités du jeu", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3000, y: 4000 })).toBe(5000);
  });

  it("retourne le côté bleu autour du centre", () => {
    expect(mirror({ x: 400, y: 420 })).toEqual({ x: 14500, y: 14480 });
  });

  it("aimante au repère le plus proche dans la tolérance, et à rien au-delà", () => {
    const reperes = [
      { x: 1000, y: 1000 },
      { x: 1200, y: 1000 },
    ];
    // 745 px pour 14 900 unités : 14 px valent 280 unités.
    expect(snapTo({ x: 1150, y: 1000 }, reperes, 745, 14)).toBe(reperes[1]);
    expect(snapTo({ x: 1000, y: 1250 }, reperes, 745, 14)).toBe(reperes[0]);
    expect(snapTo({ x: 1000, y: 1400 }, reperes, 745, 14)).toEqual({
      x: 1000,
      y: 1400,
    });
  });
});
