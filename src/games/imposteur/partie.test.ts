import { describe, expect, it } from "vitest";
import {
  agir,
  avancer,
  type Carte,
  estDemasque,
  MOT_MS,
  motValide,
  nouvelOrdre,
  nouvellePartie,
  type PartieImposteur,
  presence,
  proches,
  PROPOSITIONS,
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
    suite = agir(suite, qui, { mot: `mot${i}` }, joueurs, nom, premier);
  }
  return suite;
};

const TOUS = [A, B, C, D];
const geste = (p: PartieImposteur, de: string, g: unknown, meneur = false) =>
  agir(p, de, g, TOUS, nom, premier, meneur);

const voter = (p: PartieImposteur, pour: (id: string) => string) =>
  p.places.reduce((suite, id) => geste(suite, id, { vote: pour(id) }), p);

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
    expect(p.propositions).not.toContain(p.leurre);
    expect(p.propositions).toHaveLength(
      Math.min(PROPOSITIONS, CARTES.length - 1),
    );
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
    expect(geste(p, autre, { mot: "épée" })).toBe(p);
    const apres = geste(p, qui, { mot: "épée" });
    expect(apres.mots[qui]).toEqual(["épée"]);
    expect(apres.parle).toBe(1);
    expect(faireParler(p).phase).toBe("vote");
  });

  it("qui passe ou laisse filer le chrono laisse un mot vide", () => {
    const p = partie();
    const qui = p.ordre[0];
    expect(geste(p, qui, { passe: true }).mots[qui]).toEqual([""]);
    const suivant = p.ordre[1];
    const expire = avancer(
      geste(p, qui, { mot: "épée" }),
      MOT_MS,
      TOUS,
      CARTES,
      premier,
    );
    expect(expire.mots[suivant]).toEqual([""]);
    expect(expire.parle).toBe(2);
  });

  it("l'ordre change à chaque tour, et le dernier à parler ne parle pas en premier", () => {
    expect(nouvelOrdre(["a", "b", "c"], "a", premier)[0]).not.toBe("a");
    let p = partie();
    const premierTour = p.ordre;
    for (let i = 0; i < p.places.length; i++) {
      p = geste(p, p.ordre[p.parle], { mot: `mot${i}` });
    }
    expect(p.tour).toBe(2);
    expect(p.ordre[0]).not.toBe(premierTour[premierTour.length - 1]);
    expect(new Set(p.ordre)).toEqual(new Set(p.places));
  });

  it("un joueur parti pendant les mots est sauté ; si c'est l'imposteur, la manche est annulée", () => {
    const p = partie();
    const qui = p.ordre[p.parle];
    const reste = TOUS.filter((j) => j.id !== qui);
    if (qui === p.imposteur) {
      expect(presence(p, reste).annulee).toBe(true);
    } else {
      const suite = presence(p, reste);
      expect(suite.phase).toBe("mots");
      expect(suite.ordre[suite.parle]).not.toBe(qui);
    }
    const sansImposteur = TOUS.filter((j) => j.id !== p.imposteur);
    const annulee = presence(p, sansImposteur);
    expect(annulee.phase).toBe("revelation");
    expect(annulee.annulee).toBe(true);
    expect(annulee.gains).toEqual({});
  });

  it("démasqué, chacun des autres marque 1, et l'imposteur 2 s'il trouve le champion", () => {
    let p = faireParler(partie());
    const autres = p.places.filter((id) => id !== p.imposteur);
    p = voter(p, (id) => (id === p.imposteur ? autres[0] : p.imposteur));
    expect(p.phase).toBe("chance");
    expect(p.demasque).toBe(true);
    expect(avancer(p, 600_000, TOUS, CARTES, premier)).toBe(p);
    const trouve = geste(p, p.imposteur, { chance: p.champion });
    expect(trouve.phase).toBe("revelation");
    expect(trouve.scores[p.imposteur]).toBe(2);
    expect(trouve.scores[autres[0]]).toBe(1);
  });

  it("pas démasqué, l'imposteur devine quand même et marque 3, plus 2 s'il trouve", () => {
    let p = faireParler(partie());
    const [x, y] = p.places.filter((id) => id !== p.imposteur);
    p = { ...p, votes: { [x]: p.imposteur, [y]: x } };
    expect(estDemasque(p)).toBe(false);
    p = avancer(p, 30_000, TOUS, CARTES, premier);
    expect(p.phase).toBe("chance");
    expect(p.demasque).toBe(false);
    const rate = p.propositions.find((id) => id !== p.champion)!;
    expect(geste(p, p.imposteur, { chance: rate }).scores[p.imposteur]).toBe(3);
    expect(
      geste(p, p.imposteur, { chance: p.champion }).scores[p.imposteur],
    ).toBe(5);
  });

  it("seul le meneur peut passer la dernière chance ; la manche suivante attend que tous soient prêts", () => {
    let p = faireParler(partie());
    p = voter(p, (id) => p.places.find((autre) => autre !== id)!);
    expect(geste(p, p.places[0], { forcer: true })).toBe(p);
    p = geste(p, p.places[0], { forcer: true }, true);
    expect(p.phase).toBe("revelation");
    expect(p.chance).toBeNull();
    for (const j of [A, B, C]) {
      p = geste(p, j.id, { pret: true });
    }
    expect(avancer(p, 600_000, TOUS, CARTES, premier).manche).toBe(1);
    expect(avancer(p, 0, [A, B, C], CARTES, premier).manche).toBe(2);
    const force = geste(p, A.id, { forcer: true }, true);
    const suivante = avancer(force, 0, TOUS, CARTES, premier);
    expect(suivante.manche).toBe(2);
    expect(suivante.imposteur).not.toBe(p.imposteur);
  });
});
