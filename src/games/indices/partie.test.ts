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
  skinSansNom,
  tranche,
  visibles,
} from "./partie";
import { familleDe, typesDe } from "./familles";

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
      skins: [{ num: 1, nom: "Ahri dynastique" }],
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
      composantIds: ["1037", "1038"],
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
      composantIds: [],
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
      "roles",
      "stats",
      "recette",
      "composants",
      "description",
    ]);
  });

  it("six indices pour un champion : la région d'Univers et un skin sans le nom du champion", () => {
    const univers = {
      regions: { ionia: "Ionia" },
      champions: [{ cle: "ahri", nom: "Ahri", region: "ionia", sortie: "" }],
    };
    const ahri = enigmeDe("champion", "Ahri", DONNEES, premier, univers);
    expect(ahri?.indices.map((i) => i.type)).toEqual([
      "classes",
      "portee",
      "region",
      "skin",
      "sort",
      "titre",
    ]);
    expect(ahri?.indices).toContainEqual({ type: "region", nom: "Ionia" });
    expect(ahri?.indices).toContainEqual({ type: "skin", nom: "Dynastique" });
    expect(skinSansNom("Nautilus astronaute", "Nautilus")).toBe("Astronaute");
    expect(skinSansNom("Nunu & Willump bot", "Nunu & Willump")).toBe("Bot");
    expect(skinSansNom("Dr. Mundo PDG", "Dr. Mundo")).toBe("PDG");
    expect(skinSansNom("Ahri", "Ahri")).toBeNull();
  });

  it("un objet dit les objets qu'il permet de construire, et tous ses rôles", () => {
    const glaive = enigmeDe("objet", "1038", DONNEES_PLUS, premier);
    expect(glaive?.indices).toContainEqual({
      type: "recette",
      noms: ["Lame d'infini"],
    });
    expect(
      typesDe({ tags: ["SpellDamage", "ManaRegen", "AbilityHaste"] }),
    ).toEqual(["support", "mage"]);
    expect(typesDe({ tags: ["Health", "Armor", "Aura", "Active"] })).toEqual([
      "support",
      "tank",
    ]);
    expect(typesDe({ tags: ["Boots", "AttackSpeed"] })).toEqual(["bottes"]);
    expect(typesDe({ tags: ["Damage", "CriticalStrike"] })).toEqual(["tireur"]);
  });

  it("le premier joueur choisit la catégorie ; sans choix, elle est tirée au sort", () => {
    const p = partie();
    expect(p.phase).toBe("categorie");
    expect(p.choisit).toBe("a");
    expect(choisir(p, "b", "objet", [A, B, C], DONNEES, null, premier)).toBe(p);
    const objet = choisir(p, "a", "objet", [A, B, C], DONNEES, null, premier);
    expect(objet.phase).toBe("manche");
    expect(objet.enigme?.nom).toBe("Lame d'infini");
    const auHasard = avancer(
      p,
      CATEGORIE_MS,
      [A, B, C],
      DONNEES,
      null,
      premier,
    );
    expect(auHasard.enigme?.categorie).toBe("champion");
  });

  it("un indice de plus à chaque sixième du chrono, et moins de points à chaque indice", () => {
    const p = choisir(
      partie(),
      "a",
      "objet",
      [A, B, C],
      DONNEES,
      null,
      premier,
    );
    expect(visibles(p, 40_000)).toBe(1);
    expect(visibles(p, 19_000)).toBe(4);
    expect(deviner(p, "b", "lame d infini").partie.scores.b).toBe(100);
    const tard = avancer(p, 25_000, [A, B, C], DONNEES, null, premier);
    expect(tard.revele).toBe(4);
    expect(deviner(tard, "b", "Lame d'infini").partie.scores.b).toBe(45);
  });

  it("après le bilan, le joueur suivant choisit ; à la fin des manches, la partie s'arrête", () => {
    let p = choisir(partie(), "a", "objet", [A, B, C], DONNEES, null, premier);
    p = avancer(p, 40_000, [A, B, C], DONNEES, null, premier);
    expect(p.phase).toBe("bilan");
    p = avancer(p, BILAN_MS, [A, B, C], DONNEES, null, premier);
    expect(p.phase).toBe("categorie");
    expect(p.choisit).toBe("b");
    p = choisir(p, "b", "objet", [A, B, C], DONNEES, null, premier);
    expect(p.enigme?.categorie).toBe("champion");
    p = avancer(p, 40_000, [A, B, C], DONNEES, null, premier);
    expect(avancer(p, BILAN_MS, [A, B, C], DONNEES, null, premier).phase).toBe(
      "fin",
    );
  });

  it("si celui qui choisit part, le suivant choisit", () => {
    const p = presence(partie(), [B, C]);
    expect(p.choisit).toBe("b");
    expect(p.restantMs).toBe(CATEGORIE_MS);
  });
});

describe("indices : la grille d'objets", () => {
  const manche = (): PartieIndices => {
    const p = choisir(
      partie(),
      A.id,
      "objet",
      [A, B, C],
      DONNEES,
      null,
      premier,
    );
    return { ...p, devineurs: [A.id, B.id] };
  };

  it("la bonne icône vaut une bonne réponse ; après une mauvaise, deux secondes d'attente", () => {
    const p = manche();
    expect(p.enigme?.id).toBe("3031");
    const rate = devinerObjet(p, A.id, "1038", DONNEES_PLUS);
    expect(rate.fil.at(-1)).toEqual({ joueur: A.id, texte: "BF Glaive" });
    expect(rate.scores[A.id]).toBe(0);
    expect(devinerObjet(rate, A.id, "3031", DONNEES_PLUS)).toBe(rate);
    expect(deviner(rate, A.id, "Lame d'infini").partie).toBe(rate);
    expect(deviner(rate, B.id, "Lame d'infini").partie.trouve).toContain(B.id);
    const apres = avancer(rate, 2_000, [A, B, C], DONNEES_PLUS, null, premier);
    const trouve = devinerObjet(apres, A.id, "3031", DONNEES_PLUS);
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
