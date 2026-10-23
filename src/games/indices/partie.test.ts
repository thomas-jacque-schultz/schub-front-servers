import { describe, expect, it } from "vitest";
import type { Donnees } from "../commun/ddragon";
import {
  avancer,
  BILAN_MS,
  CATEGORIE_MS,
  choisir,
  deviner,
  devinerObjet,
  enigmeDe,
  nouvellePartie,
  type PartieIndices,
  presence,
  tranche,
  visibles,
} from "./partie";
import { familleDe } from "./familles";

const A = { id: "a", name: "Ana" };
const B = { id: "b", name: "Bob" };
const C = { id: "c", name: "Cy" };
const DONNEES: Donnees = {
  version: "16.21.1",
  champions: [
    {
      id: "Ahri",
      nom: "Ahri",
      titre: "Renarde à neuf queues",
      classes: ["Mage", "Assassin"],
      ressource: "Mana",
      aDistance: true,
      sorts: ["Ahri en fuite", "Charme"],
      skins: 20,
      histoire: "",
    },
  ],
  objets: [
    {
      id: "3031",
      nom: "Lame d'infini",
      prix: 3500,
      stats: ["+75 dégâts d'attaque"],
      composants: ["Pioche", "BF Glaive"],
      description: "Améliore considérablement les coups critiques.",
      tags: ["Damage", "CriticalStrike"],
    },
  ],
};
const DONNEES_PLUS: Donnees = {
  ...DONNEES,
  objets: [
    ...DONNEES.objets,
    {
      id: "1038",
      nom: "BF Glaive",
      prix: 1300,
      stats: [],
      composants: [],
      description: "",
      tags: ["Damage"],
    },
  ],
};
const premier = () => 0;
const partie = () => nouvellePartie([A, B, C], 40, 2, "fr", DONNEES);

describe("indices", () => {
  it("un prix se dit par tranche", () => {
    expect([50, 100, 999, 2500, 2750, 2999, 3000, 3500].map(tranche)).toEqual([
      0, 1, 1, 3, 4, 4, 5, 5,
    ]);
  });

  it("aucun indice ne contient le nom à deviner", () => {
    const ahri = enigmeDe("champion", "Ahri", DONNEES, premier);
    expect(ahri?.indices).toContainEqual({ type: "sort", nom: "Charme" });
    expect(JSON.stringify(ahri?.indices)).not.toContain("Ahri");
    const lame = enigmeDe("objet", "3031", DONNEES, premier);
    expect(lame?.indices.map((i) => i.type)).toEqual([
      "prix",
      "stats",
      "composants",
      "description",
    ]);
  });

  it("le premier joueur choisit la catégorie ; sans choix, elle est tirée au sort", () => {
    const p = partie();
    expect(p.phase).toBe("categorie");
    expect(p.choisit).toBe("a");
    expect(choisir(p, "b", "objet", [A, B, C], DONNEES, premier)).toBe(p);
    const objet = choisir(p, "a", "objet", [A, B, C], DONNEES, premier);
    expect(objet.phase).toBe("manche");
    expect(objet.enigme?.nom).toBe("Lame d'infini");
    const auHasard = avancer(p, CATEGORIE_MS, [A, B, C], DONNEES, premier);
    expect(auHasard.enigme?.categorie).toBe("champion");
  });

  it("un indice de plus à chaque quart du chrono, et moins de points à chaque indice", () => {
    const p = choisir(partie(), "a", "objet", [A, B, C], DONNEES, premier);
    expect(visibles(p, 40_000)).toBe(1);
    expect(visibles(p, 19_000)).toBe(3);
    expect(deviner(p, "b", "lame d infini").partie.scores.b).toBe(100);
    const tard = avancer(p, 25_000, [A, B, C], DONNEES, premier);
    expect(tard.revele).toBe(3);
    expect(deviner(tard, "b", "Lame d'infini").partie.scores.b).toBe(45);
  });

  it("après le bilan, le joueur suivant choisit ; à la fin des manches, la partie s'arrête", () => {
    let p = choisir(partie(), "a", "objet", [A, B, C], DONNEES, premier);
    p = avancer(p, 40_000, [A, B, C], DONNEES, premier);
    expect(p.phase).toBe("bilan");
    p = avancer(p, BILAN_MS, [A, B, C], DONNEES, premier);
    expect(p.phase).toBe("categorie");
    expect(p.choisit).toBe("b");
    p = choisir(p, "b", "objet", [A, B, C], DONNEES, premier);
    expect(p.enigme?.categorie).toBe("champion");
    p = avancer(p, 40_000, [A, B, C], DONNEES, premier);
    expect(avancer(p, BILAN_MS, [A, B, C], DONNEES, premier).phase).toBe("fin");
  });

  it("si celui qui choisit part, le suivant choisit", () => {
    const p = presence(partie(), [B, C]);
    expect(p.choisit).toBe("b");
    expect(p.restantMs).toBe(CATEGORIE_MS);
  });
});

describe("indices : la grille d'objets", () => {
  const manche = (): PartieIndices => {
    const p = choisir(partie(), A.id, "objet", [A, B, C], DONNEES, premier);
    return { ...p, devineurs: [A.id, B.id] };
  };

  it("la bonne icône vaut une bonne réponse ; une mauvaise s'inscrit au fil, sans pénalité", () => {
    const p = manche();
    expect(p.enigme?.id).toBe("3031");
    const rate = devinerObjet(p, A.id, "1038", DONNEES_PLUS);
    expect(rate.fil.at(-1)).toEqual({ joueur: A.id, texte: "BF Glaive" });
    expect(rate.scores[A.id]).toBe(0);
    const trouve = devinerObjet(rate, A.id, "3031", DONNEES_PLUS);
    expect(trouve.trouve).toContain(A.id);
    expect(trouve.scores[A.id]).toBeGreaterThan(0);
    expect(devinerObjet(trouve, A.id, "3031", DONNEES_PLUS)).toBe(trouve);
  });

  it("chaque objet tombe dans une famille, comme à la boutique", () => {
    expect(familleDe({ tags: ["Boots", "AttackSpeed"] })).toBe("bottes");
    expect(familleDe({ tags: ["Health", "Lane", "SpellDamage"] })).toBe(
      "depart",
    );
    expect(familleDe({ tags: ["SpellDamage", "ManaRegen"] })).toBe("support");
    expect(familleDe({ tags: ["AttackSpeed", "SpellDamage", "OnHit"] })).toBe(
      "mage",
    );
    expect(familleDe({ tags: ["Damage", "CriticalStrike"] })).toBe("tireur");
    expect(familleDe({ tags: ["Damage", "ArmorPenetration"] })).toBe(
      "assassin",
    );
    expect(familleDe({ tags: ["Damage", "Health"] })).toBe("combattant");
    expect(familleDe({ tags: ["Health", "Armor"] })).toBe("tank");
  });
});
