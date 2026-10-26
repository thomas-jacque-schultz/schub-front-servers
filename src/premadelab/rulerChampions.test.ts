import { describe, expect, it } from "vitest";
import { portees } from "./rulerChampions";

describe("les portées d'un sort", () => {
  it("garde une portée fixe une seule fois", () => {
    expect(portees([970, 970, 970, 970, 970])).toEqual([970]);
  });

  it("garde chaque palier d'une portée qui grandit avec le rang", () => {
    expect(portees([4000, 4750, 5500])).toEqual([4000, 4750, 5500]);
  });

  it("ne trace rien quand Riot ne publie pas de portée", () => {
    expect(portees([25000, 25000, 25000])).toEqual([]);
    expect(portees([0, 0, 0])).toEqual([]);
  });
});
