import { describe, expect, it } from "vitest";
import {
  applique,
  appliqueTout,
  inverse,
  lisOperation,
  lisPlan,
  type Element,
  type Operation,
  type Plan,
} from "./plan";

const icone = (id: string, x = 1000): Element => ({
  id,
  type: "icone",
  icone: "ward",
  at: { x, y: 1000 },
  camp: null,
  vision: false,
});

describe("le plan du Macro Planner", () => {
  it("pose, remplace et retire par identifiant", () => {
    let plan: Plan = [];
    plan = applique(plan, { t: "pose", e: icone("a") });
    plan = applique(plan, { t: "pose", e: icone("b") });
    plan = applique(plan, { t: "pose", e: icone("a", 2000) });
    expect(plan.map((e) => e.id)).toEqual(["a", "b"]);
    expect(plan[0]).toEqual(icone("a", 2000));
    expect(applique(plan, { t: "retire", id: "a" }).map((e) => e.id)).toEqual([
      "b",
    ]);
  });

  it("rejouer un historique sur un plan qui en contient déjà une partie donne le même plan", () => {
    const historique: Operation[] = [
      { t: "pose", e: icone("a") },
      { t: "pose", e: icone("b") },
      { t: "retire", id: "a" },
      { t: "vide" },
      { t: "pose", e: icone("c") },
      { t: "pose", e: icone("c", 3000) },
    ];
    const vrai = appliqueTout([], historique);
    for (let deja = 0; deja <= historique.length; deja++) {
      const enregistre = appliqueTout([], historique.slice(0, deja));
      expect(appliqueTout(enregistre, historique)).toEqual(vrai);
    }
  });

  it("annuler un geste rend le plan d'avant, ordre compris", () => {
    const avant: Plan = [icone("a"), icone("b"), icone("c")];
    for (const geste of [
      [{ t: "retire", id: "b" }],
      [{ t: "vide" }],
      [
        { t: "pose", e: icone("b", 5000) },
        { t: "pose", e: icone("d") },
      ],
      [
        { t: "retire", id: "a" },
        { t: "retire", id: "c" },
      ],
    ] as Operation[][]) {
      const apres = appliqueTout(avant, geste);
      expect(appliqueTout(apres, inverse(avant, geste))).toEqual(avant);
    }
  });

  it("écarte ce qui ne se lit pas, d'un autre membre ou du stockage", () => {
    expect(
      lisOperation({
        t: "pose",
        e: {
          id: "x",
          type: "trait",
          points: [],
          encre: "#FFFFFF",
          epaisseur: 0.01,
        },
      }),
    ).toBeNull();
    expect(lisOperation({ t: "retire", id: "<script>" })).toBeNull();
    expect(
      lisOperation({
        t: "pose",
        e: { ...icone("a"), icone: "https://ailleurs" },
      }),
    ).toBeNull();
    expect(lisPlan([icone("a"), { id: "b", type: "inconnu" }, null])).toEqual([
      icone("a"),
    ]);
  });
});
