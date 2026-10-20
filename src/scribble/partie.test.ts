import { describe, expect, it } from "vitest";
import { distance, normalise } from "../commun/devinette";
import {
  avancer,
  BILAN_MS,
  choisir,
  deviner,
  masque,
  nouvellePartie,
  presence,
} from "./partie";

const A = { id: "a", name: "Ana" };
const B = { id: "b", name: "Bob" };
const C = { id: "c", name: "Cy" };
const MOTS = ["Kai'Sa", "Dr. Mundo", "Jinx", "Lee Sin", "Nunu & Willump"];
const premier = () => 0;

const enDessin = () =>
  choisir(nouvellePartie([A, B, C], 80, "fr", MOTS, premier), 0);

describe("partie", () => {
  it("Kai'Sa, kaisa et KAISA se valent", () => {
    expect(normalise("Kai'Sa")).toBe("kaisa");
    expect(normalise("KAISA")).toBe("kaisa");
    expect(normalise("  kaï sa ")).toBe("kaisa");
    expect(normalise("Dr. Mundo")).toBe("drmundo");
  });

  it("une lettre d'écart est proche, deux ne le sont pas", () => {
    expect(distance("kaisa", "kaisaa")).toBe(1);
    expect(distance("kaisa", "kaiza")).toBe(1);
    expect(distance("kaisa", "kasia")).toBe(2);
  });

  it("le masque garde la ponctuation et les espaces", () => {
    expect(masque("Dr. Mundo", [])).toBe("__. _____");
    expect(masque("Kai'Sa", [0])).toBe("K__'__");
  });

  it("le premier joueur dessine et choisit parmi trois mots", () => {
    const p = nouvellePartie([A, B, C], 80, "fr", MOTS, premier);
    expect(p.phase).toBe("choix");
    expect(p.dessinateur).toBe("a");
    expect(p.choix).toHaveLength(3);
    expect(p.devineurs).toEqual(["b", "c"]);
  });

  it("une bonne réponse rapporte plus tôt, et n'entre pas dans le fil", () => {
    const p = enDessin();
    const tot = deviner(p, "b", "kaisa").partie;
    const tard = deviner({ ...p, restantMs: 8_000 }, "b", "KAISA").partie;
    expect(tot.scores.b).toBeGreaterThan(tard.scores.b);
    expect(tot.scores.a).toBe(25);
    expect(tot.fil).toEqual([{ joueur: "b", trouve: true }]);
  });

  it("une réponse proche n'est dite qu'à son auteur, une fausse va dans le fil", () => {
    const p = enDessin();
    const proche = deviner(p, "b", "kaisaa");
    expect(proche.proche).toBe(true);
    expect(proche.partie.fil).toEqual([]);
    expect(deviner(p, "b", "jinx").partie.fil).toEqual([
      { joueur: "b", texte: "jinx" },
    ]);
  });

  it("le dessinateur ne devine pas, et la manche se clôt quand tous ont trouvé", () => {
    const p = enDessin();
    expect(deviner(p, "a", "kaisa").partie).toBe(p);
    const un = deviner(p, "b", "kaisa").partie;
    expect(un.phase).toBe("dessin");
    expect(deviner(un, "c", "Kai'Sa").partie.phase).toBe("bilan");
  });

  it("le chrono révèle des lettres, puis passe la main au joueur suivant", () => {
    const p = choisir(
      nouvellePartie([A, B, C], 80, "fr", ["Nunu & Willump", ...MOTS], premier),
      0,
    );
    const mi = avancer(p, 41_000, [A, B, C], premier);
    expect(mi.revele).toHaveLength(1);
    const fin = avancer(mi, 40_000, [A, B, C], premier);
    expect(fin.phase).toBe("bilan");
    const suivante = avancer(fin, BILAN_MS, [A, B, C], premier);
    expect(suivante.phase).toBe("choix");
    expect(suivante.dessinateur).toBe("b");
  });

  it("un tour complet mène au récapitulatif ; un absent est sauté", () => {
    let p = nouvellePartie([A, B, C], 80, "fr", MOTS, premier);
    p = { ...p, tour: 1, dessinateur: "b", phase: "bilan", restantMs: 0 };
    const sansC = avancer(p, 0, [A, B], premier);
    expect(sansC.phase).toBe("fin");
  });

  it("qui arrive en cours devine à la manche suivante ; un dessinateur parti clôt la manche", () => {
    const D = { id: "d", name: "Dee" };
    const p = presence(enDessin(), [A, B, C, D]);
    expect(p.ordre).toContain("d");
    expect(deviner(p, "d", "kaisa").partie.scores.d).toBe(0);
    expect(presence(enDessin(), [B, C]).phase).toBe("bilan");
  });

  it("le départ du dernier qui cherchait clôt la manche", () => {
    const p = deviner(enDessin(), "b", "kaisa").partie;
    expect(presence(p, [A, B]).phase).toBe("bilan");
    expect(presence(p, [A, B, C]).phase).toBe("dessin");
  });
});
