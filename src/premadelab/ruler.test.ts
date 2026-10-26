import { describe, expect, it } from "vitest";
import { lireMesure, REPERES } from "./ruler";

const trouve = (id: string, side: string) =>
  REPERES.find((repere) => repere.id === id && repere.side === side);

describe("les repères de la règle", () => {
  it("donne au rouge le miroir du bleu, top et bot inversés", () => {
    const bleue = trouve("outerTowerTop", "blue");
    const rouge = trouve("outerTowerBot", "red");
    expect(rouge).toMatchObject({ x: 14900 - bleue!.x, y: 14900 - bleue!.y });
    expect(trouve("nexusTowerTop", "red")).toMatchObject({
      x: 14900 - trouve("nexusTowerBot", "blue")!.x,
    });
  });

  it("n'a qu'un repère par nom et par camp", () => {
    const cles = REPERES.map((repere) => `${repere.side}:${repere.id}`);
    expect(new Set(cles).size).toBe(cles.length);
  });

  it("rend la mesure par défaut sans stockage", () => {
    expect(lireMesure().r).toBe(1000);
  });
});
