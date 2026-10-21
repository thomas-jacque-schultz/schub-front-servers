import { describe, expect, it } from "vitest";
import {
  avancer,
  BILAN_MS,
  deviner,
  grossissement,
  nouvellePartie,
  presence,
} from "./partie";

const A = { id: "a", name: "Ana" };
const B = { id: "b", name: "Bob" };
const C = { id: "c", name: "Cy" };
const CHAMPIONS = [
  { id: "Kaisa", nom: "Kai'Sa" },
  { id: "Jinx", nom: "Jinx" },
  { id: "Ahri", nom: "Ahri" },
];
const premier = () => 0;
const partie = (manches = 2) =>
  nouvellePartie([A, B, C], 30, manches, "fr", CHAMPIONS, premier);

describe("zoom", () => {
  it("tout le monde devine, et plus tôt vaut plus", () => {
    const p = partie();
    expect(p.phase).toBe("manche");
    expect(p.devineurs).toEqual(["a", "b", "c"]);
    const tot = deviner(p, "a", "kaisa").partie;
    const tard = deviner({ ...p, restantMs: 3_000 }, "a", "KAI SA").partie;
    expect(tot.scores.a).toBe(100);
    expect(tard.scores.a).toBe(37);
  });

  it("une réponse proche n'est dite qu'à son auteur, une fausse va dans le fil", () => {
    const p = partie();
    expect(deviner(p, "a", "kaisaa").proche).toBe(true);
    expect(deviner(p, "a", "jinx").partie.fil).toEqual([
      { joueur: "a", texte: "jinx" },
    ]);
  });

  it("quand tous ont trouvé, le bilan montre le champion ; après la dernière manche, la fin", () => {
    let p = partie(2);
    for (const id of ["a", "b", "c"]) {
      p = deviner(p, id, "Kai'Sa").partie;
    }
    expect(p.phase).toBe("bilan");
    p = avancer(p, BILAN_MS, [A, B, C], premier);
    expect(p.manche).toBe(2);
    expect(p.champion?.nom).toBe("Jinx");
    p = avancer(p, 30_000, [A, B, C], premier);
    expect(p.phase).toBe("bilan");
    expect(avancer(p, BILAN_MS, [A, B, C], premier).phase).toBe("fin");
  });

  it("le zoom part de huit fois et finit sur l'image entière", () => {
    const p = partie();
    expect(grossissement(p, 30_000)).toBe(8);
    expect(grossissement(p, 0)).toBe(1);
    expect(grossissement({ ...p, phase: "bilan" }, 30_000)).toBe(1);
  });

  it("le départ du dernier qui cherchait clôt la manche ; qui arrive attend la suivante", () => {
    const p = deviner(
      deviner(partie(), "a", "kaisa").partie,
      "b",
      "kaisa",
    ).partie;
    expect(presence(p, [A, B]).phase).toBe("bilan");
    const D = { id: "d", name: "Dee" };
    const avecD = presence(partie(), [A, B, C, D]);
    expect(avecD.scores.d).toBe(0);
    expect(deviner(avecD, "d", "kaisa").partie.scores.d).toBe(0);
  });
});
