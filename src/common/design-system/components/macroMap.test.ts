import { describe, expect, it } from "vitest";
import {
  distance,
  MAP_BOUNDS,
  radiusOnScreen,
  snapTo,
  terrainAt,
  toScreen,
  toWorld,
} from "./macroMap";

describe("la géométrie du Macro Planner", () => {
  it("cale les coins de la minimap sur les bornes de la Faille", () => {
    expect(toScreen({ x: MAP_BOUNDS.minX, y: MAP_BOUNDS.minY }, 512)).toEqual({
      x: 0,
      y: 512,
    });
    expect(toScreen({ x: MAP_BOUNDS.maxX, y: MAP_BOUNDS.maxY }, 512)).toEqual({
      x: 512,
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
    expect(toWorld({ x: -20, y: 900 }, 800)).toEqual({
      x: MAP_BOUNDS.minX,
      y: MAP_BOUNDS.minY,
    });
  });

  it("mesure en unités du jeu", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3000, y: 4000 })).toBe(5000);
  });

  it("dessine un rayon un peu moins haut que large, la carte l'étant aussi", () => {
    const rayon = radiusOnScreen(1000, 1000);
    expect(rayon.x).toBeCloseTo(66.71, 1);
    expect(rayon.y).toBeLessThan(rayon.x);
  });

  it("aimante au repère le plus proche dans la tolérance, et à rien au-delà", () => {
    const reperes = [
      { x: 1000, y: 1000 },
      { x: 1200, y: 1000 },
    ];
    // 745 px pour 14 990 unités : 14 px valent 282 unités.
    expect(snapTo({ x: 1150, y: 1000 }, reperes, 745, 14)).toBe(reperes[1]);
    expect(snapTo({ x: 1000, y: 1250 }, reperes, 745, 14)).toBe(reperes[0]);
    expect(snapTo({ x: 1000, y: 1400 }, reperes, 745, 14)).toEqual({
      x: 1000,
      y: 1400,
    });
  });
});

describe("les zones de la minimap", () => {
  it("lit un mur dans un pixel transparent", () => {
    expect(terrainAt(0, 0, 0, 0, 0.5, 0.5)).toEqual({
      ground: 0,
      river: 0,
      base: 0,
    });
  });

  it("lit un chemin dans le kaki, la rivière dans le bleu, une base dans le gris-bleu", () => {
    expect(terrainAt(144, 144, 112, 192, 0.3, 0.3)).toEqual({
      ground: 1,
      river: 0,
      base: 0,
    });
    expect(terrainAt(16, 112, 144, 192, 0.25, 0.2)).toMatchObject({
      ground: 1,
      river: 1,
    });
    expect(terrainAt(96, 128, 128, 192, 0.2, 0.8)).toMatchObject({
      ground: 1,
      river: 0,
      base: 1,
    });
  });

  it("ne prend pas le fondu de la rivière au milieu de la carte pour une base", () => {
    expect(terrainAt(80, 128, 128, 192, 0.5, 0.55).base).toBe(0);
  });

  it("ne met pas de rivière dans une fontaine", () => {
    expect(terrainAt(64, 96, 128, 192, 0.04, 0.96)).toMatchObject({
      river: 0,
      base: 1,
    });
  });
});
