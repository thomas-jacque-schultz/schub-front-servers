import { describe, expect, it } from "vitest";
import { MAP_BOUNDS } from "../common";
import { lireMesure, REPERES } from "./ruler";

describe("les repères de la règle", () => {
  it("n'a qu'un repère par nom et par camp", () => {
    const cles = REPERES.map((repere) => `${repere.side}:${repere.id}`);
    expect(new Set(cles).size).toBe(cles.length);
  });

  it("donne aux deux camps les mêmes repères", () => {
    const ids = (side: string) =>
      REPERES.filter((repere) => repere.side === side)
        .map((repere) => repere.id)
        .sort();
    expect(ids("red")).toEqual(ids("blue"));
  });

  it("place tout sur la carte, à coordonnées entières", () => {
    for (const repere of REPERES) {
      expect(Number.isInteger(repere.x) && Number.isInteger(repere.y)).toBe(
        true,
      );
      expect(repere.x).toBeGreaterThanOrEqual(MAP_BOUNDS.minX);
      expect(repere.y).toBeLessThanOrEqual(MAP_BOUNDS.maxY);
    }
  });

  it("ne dit estimé que le nexus", () => {
    expect(
      REPERES.filter((repere) => repere.approche).map((repere) => repere.id),
    ).toEqual(["nexus", "nexus"]);
  });

  it("rend la mesure par défaut sans stockage", () => {
    expect(lireMesure().r).toBe(1000);
  });
});
