import { describe, expect, it } from "vitest";
import { MAP_BOUNDS } from "../common";
import { planDeDepart, REPERES, TRAJETS_DE_REFERENCE } from "./ruler";

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

  it("relie chaque trajet de référence à deux repères distincts", () => {
    const trajets = TRAJETS_DE_REFERENCE.flatMap((groupe) => groupe.trajets);
    expect(trajets).toHaveLength(21);
    for (const { de, vers } of trajets) {
      expect(de).not.toBe(vers);
    }
  });

  it("commence par une mesure, de la tour extérieure du mid au Baron", () => {
    expect(planDeDepart()).toMatchObject([{ type: "mesure", r: 1000 }]);
  });
});
