import { describe, expect, it } from "vitest";
import { arrondi, estMorceau, Tableau } from "./traits";

describe("traits", () => {
  it("un morceau reprend au dernier point déjà connu de son trait", () => {
    const tableau = new Tableau();
    expect(
      tableau.ajoute({
        k: "t",
        id: "a",
        c: "#fff",
        w: 0.01,
        p: [0.1, 0.1, 0.2, 0.2],
      }),
    ).toEqual([0.1, 0.1, 0.2, 0.2]);
    expect(
      tableau.ajoute({ k: "t", id: "a", c: "#fff", w: 0.01, p: [0.3, 0.3] }),
    ).toEqual([0.2, 0.2, 0.3, 0.3]);
    expect(
      tableau.ajoute({ k: "t", id: "b", c: "#fff", w: 0.01, p: [0.5, 0.5] }),
    ).toEqual([0.5, 0.5]);
  });

  it("les coordonnées restent dans le tableau, à quatre décimales", () => {
    expect(arrondi(0.123456)).toBe(0.1235);
    expect(arrondi(-0.2)).toBe(0);
    expect(arrondi(1.4)).toBe(1);
  });

  it("un message qui n'est pas un morceau de trait est ignoré", () => {
    expect(
      estMorceau({ k: "t", id: "a", c: "#fff", w: 0.01, p: [0.1, 0.2] }),
    ).toBe(true);
    expect(estMorceau({ k: "t", id: "a", c: "#fff", w: 0.01, p: [0.1] })).toBe(
      false,
    );
    expect(estMorceau({ k: "autre" })).toBe(false);
    expect(estMorceau(null)).toBe(false);
  });
});
