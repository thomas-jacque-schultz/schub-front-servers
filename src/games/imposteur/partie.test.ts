import { describe, expect, it } from "vitest";
import {
  agir,
  avancer,
  type Carte,
  CHANCE_MS,
  demasque,
  motValide,
  nouvellePartie,
  type PartieImposteur,
  presence,
  proches,
  REVELATION_MS,
  TOURS,
} from "./partie";

const A = { id: "a", name: "Ana" };
const B = { id: "b", name: "Bob" };
const C = { id: "c", name: "Cy" };
const D = { id: "d", name: "Dee" };
const CARTES: Carte[] = [
  {
    id: "Garen",
    nom: "Garen",
    classes: ["Fighter", "Tank"],
    region: "demacia",
  },
  { id: "Lux", nom: "Lux", classes: ["Mage", "Support"], region: "demacia" },
  { id: "Ahri", nom: "Ahri", classes: ["Mage", "Assassin"], region: "ionia" },
  { id: "Teemo", nom: "Teemo", classes: ["Marksman"], region: "bandle-city" },
  { id: "Zed", nom: "Zed", classes: ["Assassin"], region: "ionia" },
];
const premier = () => 0;
const nom = (id: string) => CARTES.find((c) => c.id === id)?.nom ?? "";
const partie = () => nouvellePartie([A, B, C, D], 3, "fr", CARTES, premier);

const faireParler = (p: PartieImposteur, joueurs = [A, B, C, D]) => {
  let suite = p;
  for (let i = 0; i < TOURS * suite.ordre.length; i++) {
    const qui = suite.ordre[suite.parle];
    suite = agir(suite, qui, { mot: `mot${i}` }, joueurs, nom);
  }
  return suite;
};

describe("in-vo-posteur", () => {
  it("le leurre est proche du champion : même classe principale ou même région", () => {
    expect(proches(CARTES[0], CARTES).map((c) => c.id)).toEqual(["Lux"]);
    expect(proches(CARTES[2], CARTES).map((c) => c.id)).toEqual(["Lux", "Zed"]);
    expect(proches(CARTES[3], CARTES)).toEqual([]);
  });

  it("tous ont la même carte sauf l'imposteur, qui a un champion proche", () => {
    const p = partie();
    expect(p.phase).toBe("mots");
    const autres = Object.entries(p.cartes).filter(
      ([id]) => id !== p.imposteur,
    );
    expect(new Set(autres.map(([, c]) => c))).toEqual(new Set([p.champion]));
    expect(p.cartes[p.imposteur]).toBe(p.leurre);
    expect(p.leurre).not.toBe(p.champion);
    expect(p.propositions).toContain(p.champion);
    expect(p.propositions).toHaveLength(4);
  });

  it("un mot seul, sans le nom de sa carte", () => {
    expect(motValide("épée", "Garen")).toBe(true);
    expect(motValide("deux mots", "Garen")).toBe(false);
    expect(motValide("SuperGAREN", "Garen")).toBe(false);
    expect(motValide("kaisa!", "Kai'Sa")).toBe(false);
  });

  it("seul celui dont c'est le tour parle ; après trois tours, le vote", () => {
    const p = partie();
    const qui = p.ordre[p.parle];
    const autre = p.ordre[1];
    expect(agir(p, autre, { mot: "épée" }, [A, B, C, D], nom)).toBe(p);
    const apres = agir(p, qui, { mot: "épée" }, [A, B, C, D], nom);
    expect(apres.mots[qui]).toEqual(["épée"]);
    expect(apres.parle).toBe(1);
    expect(faireParler(p).phase).toBe("vote");
  });

  it("un joueur parti pendant les mots est sauté ; si c'est l'imposteur, la manche est annulée", () => {
    const p = partie();
    const qui = p.ordre[p.parle];
    const reste = [A, B, C, D].filter((j) => j.id !== qui);
    if (qui === p.imposteur) {
      expect(presence(p, reste).annulee).toBe(true);
    } else {
      const suite = presence(p, reste);
      expect(suite.phase).toBe("mots");
      expect(suite.ordre[suite.parle]).not.toBe(qui);
    }
    const sansImposteur = [A, B, C, D].filter((j) => j.id !== p.imposteur);
    const annulee = presence(p, sansImposteur);
    expect(annulee.phase).toBe("revelation");
    expect(annulee.annulee).toBe(true);
    expect(annulee.gains).toEqual({});
  });

  it("démasqué, chacun des autres marque 1 et l'imposteur a sa dernière chance", () => {
    let p = faireParler(partie());
    const autres = p.ordre.filter((id) => id !== p.imposteur);
    for (const id of autres) {
      p = agir(p, id, { vote: p.imposteur }, [A, B, C, D], nom);
    }
    p = agir(p, p.imposteur, { vote: autres[0] }, [A, B, C, D], nom);
    expect(p.phase).toBe("chance");
    const trouve = agir(
      p,
      p.imposteur,
      { chance: p.champion },
      [A, B, C, D],
      nom,
    );
    expect(trouve.phase).toBe("revelation");
    expect(trouve.scores[p.imposteur]).toBe(2);
    expect(trouve.scores[autres[0]]).toBe(1);
    expect(
      avancer(p, CHANCE_MS, [A, B, C, D], CARTES, premier).scores[p.imposteur],
    ).toBe(0);
  });

  it("à égalité, l'imposteur s'en sort et marque 3", () => {
    let p = faireParler(partie());
    const [x, y] = p.ordre.filter((id) => id !== p.imposteur);
    p = { ...p, votes: { [x]: p.imposteur, [y]: x } };
    expect(demasque(p)).toBe(false);
    const fin = avancer(p, 30_000, [A, B, C, D], CARTES, premier);
    expect(fin.phase).toBe("revelation");
    expect(fin.scores[p.imposteur]).toBe(3);
    const suivante = avancer(fin, REVELATION_MS, [A, B, C, D], CARTES, premier);
    expect(suivante.manche).toBe(2);
    expect(suivante.imposteur).not.toBe(p.imposteur);
  });
});
