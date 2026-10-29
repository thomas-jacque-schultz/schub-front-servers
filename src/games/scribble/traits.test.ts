import { describe, expect, it } from "vitest";
import { arrondi, estMorceau, estOperation, forme, Tableau } from "./traits";
import { enRgba, remplis } from "./remplissage";

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

  it("un remplissage et une annulation sont des opérations, pas un message mal formé", () => {
    expect(estOperation({ k: "r", id: "a-1", c: "#fff", p: [0.5, 0.5] })).toBe(
      true,
    );
    expect(estOperation({ k: "r", id: "a-1", c: "#fff", p: [0.5] })).toBe(
      false,
    );
    expect(estOperation({ k: "u", id: "a-1" })).toBe(true);
    expect(estOperation({ k: "u" })).toBe(false);
  });

  it("un rectangle se referme ; un cercle passe par les quatre bords de son cadre", () => {
    expect(forme("rectangle", [0.1, 0.2], [0.3, 0.4])).toEqual([
      0.1, 0.2, 0.3, 0.2, 0.3, 0.4, 0.1, 0.4, 0.1, 0.2,
    ]);
    const cercle = forme("cercle", [0.2, 0.2], [0.6, 0.4]);
    const xs = cercle.filter((_, i) => i % 2 === 0);
    const ys = cercle.filter((_, i) => i % 2 === 1);
    expect([Math.min(...xs), Math.max(...xs)]).toEqual([0.2, 0.6]);
    expect([Math.min(...ys), Math.max(...ys)]).toEqual([0.2, 0.4]);
    expect(cercle.slice(0, 2)).toEqual(cercle.slice(-2));
  });
});

describe("pot de peinture", () => {
  // Une image de 5 × 3 : une colonne blanche au milieu sépare deux zones transparentes.
  const image = () => {
    const data = new Uint8ClampedArray(5 * 3 * 4);
    for (let y = 0; y < 3; y++) {
      data.set([255, 255, 255, 255], (y * 5 + 2) * 4);
    }
    return { width: 5, height: 3, data };
  };
  const pixel = (p: ReturnType<typeof image>, x: number, y: number) => [
    ...p.data.slice((y * 5 + x) * 4, (y * 5 + x) * 4 + 4),
  ];

  it("remplit la zone touchée, s'arrête au trait et déborde d'un pixel sur son bord", () => {
    const p = image();
    expect(remplis(p, 0, 0, enRgba("#FF0000"))).toBe(true);
    expect(pixel(p, 1, 2)).toEqual([255, 0, 0, 255]);
    expect(pixel(p, 2, 1)).toEqual([255, 0, 0, 255]);
    expect(pixel(p, 3, 1)).toEqual([0, 0, 0, 0]);
  });

  it("une zone déjà de la bonne couleur ne change pas ; la gomme rend transparent", () => {
    const p = image();
    expect(remplis(p, 2, 0, enRgba("#FFFFFF"))).toBe(false);
    expect(remplis(p, 2, 0, enRgba(null))).toBe(true);
    expect(pixel(p, 2, 2)).toEqual([0, 0, 0, 0]);
  });
});
