import { describe, expect, it } from "vitest";
import banque from "./banque.json";
import fabriquees from "./fabriquees.json";
import {
  agir,
  avancer,
  BILAN_MS,
  nouvellePartie,
  type PartieQuiz,
  presence,
  publique,
  THEME_MS,
} from "./partie";
import {
  genere,
  type QuestionBanque,
  THEMES,
  themesDisponibles,
} from "./questions";
import type { Vigilance } from "../commun/vigilance";

const A = { id: "a", name: "Ana" };
const B = { id: "b", name: "Bob" };
const C = { id: "c", name: "Cy" };
const BANQUE = [...banque, ...fabriquees] as QuestionBanque[];
const sequence = (valeurs: number[]) => {
  let i = 0;
  return () => valeurs[i++ % valeurs.length];
};
const partie = (themes = [...THEMES]) =>
  nouvellePartie(
    [A, B, C],
    themes,
    20,
    3,
    "fr",
    BANQUE,
    sequence([0.1, 0.7, 0.3, 0.9, 0.5]),
  );
const rep = (choix: number, vu: Partial<Vigilance> = {}) => ({
  choix,
  absent: false,
  copie: false,
  ...vu,
});

describe("questions pour un invocateur", () => {
  it("la banque : chaque question a quatre choix distincts dans les deux langues, une date et une source", () => {
    for (const q of BANQUE) {
      for (const lang of ["fr", "en"] as const) {
        expect(new Set(q[lang].choix).size).toBe(4);
        expect(q[lang].enonce && q[lang].explication).toBeTruthy();
      }
      expect(q.date).toMatch(/^\d{4}/);
      expect(q.source).toMatch(/^https:\/\//);
      expect(q.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(q.image ?? "https://").toMatch(/^https:\/\//);
      if (q.imagesChoix) {
        expect(q.imagesChoix).toHaveLength(4);
      }
    }
    expect(new Set(BANQUE.map((q) => q.id)).size).toBe(BANQUE.length);
  });

  it("chaque thème tient une partie de 15 questions sans doublon", () => {
    for (const theme of THEMES) {
      const posees: string[] = [];
      for (let i = 0; i < 15; i++) {
        const q = genere(theme, BANQUE, "fr", posees, Math.random);
        expect(q, `${theme} n°${i + 1}`).not.toBeNull();
        expect(new Set(q!.choix).size).toBe(4);
        expect(q!.choix[q!.bonne]).toBeTruthy();
        posees.push(q!.cle);
      }
    }
  }, 10_000);

  it("un thème sans question dans la banque n'est pas proposé", () => {
    expect(
      themesDisponibles(BANQUE.filter((q) => q.theme !== "monde")),
    ).not.toContain("monde");
  });

  it("les icônes des choix suivent les choix quand ils sont mélangés", () => {
    const recette = BANQUE.find((q) => q.imagesChoix)!;
    for (let i = 0; i < 10; i++) {
      const q = genere(recette.theme, [recette], "fr", [], Math.random)!;
      expect(q.choix[q.bonne]).toBe(recette.fr.choix[0]);
      expect(q.imagesChoix![q.bonne]).toEqual(recette.imagesChoix![0]);
    }
  });

  it("la bonne réponse n'est pas diffusée pendant la question", () => {
    const p = partie();
    expect(p.phase).toBe("question");
    expect(p.secret).not.toBeNull();
    expect(publique(p).secret).toBeNull();
    expect(JSON.stringify(publique(p))).not.toContain("explication");
  });

  it("une bonne réponse vaut 50, plus jusqu'à 20 de rapidité ; chacun choisit le thème à tour de rôle", () => {
    let p = partie();
    const bonne = p.secret!.bonne;
    const fausse = (bonne + 1) % 4;
    p = agir(p, "b", rep(bonne), [A, B, C], BANQUE, Math.random);
    p = avancer(p, 10_000, [A, B, C], BANQUE, Math.random);
    p = agir(p, "c", rep(bonne), [A, B, C], BANQUE, Math.random);
    expect(agir(p, "c", rep(fausse), [A, B, C], BANQUE, Math.random)).toBe(p);
    p = agir(p, "a", rep(fausse), [A, B, C], BANQUE, Math.random);
    expect(p.phase).toBe("bilan");
    expect(p.solution?.bonne).toBe(bonne);
    expect(p.scores).toEqual({ a: 0, b: 70, c: 60 });
    expect([...p.ordre].sort()).toEqual(["a", "b", "c"]);
    p = avancer(p, BILAN_MS, [A, B, C], BANQUE, Math.random);
    expect(p.phase).toBe("theme");
    expect(p.choisit).toBe(p.ordre[0]);
    expect(p.proposes).toHaveLength(3);
    const choisi = agir(
      p,
      p.ordre[0],
      p.proposes[0],
      [A, B, C],
      BANQUE,
      Math.random,
    );
    expect(choisi.phase).toBe("question");
    expect(choisi.theme).toBe(p.proposes[0]);
    p = avancer(p, THEME_MS, [A, B, C], BANQUE, Math.random);
    expect(p.phase).toBe("question");
    p = avancer(p, 20_000, [A, B, C], BANQUE, Math.random);
    p = avancer(p, BILAN_MS, [A, B, C], BANQUE, Math.random);
    expect(p.choisit).toBe(p.ordre[1]);
  });

  it("sur cinq questions, un joueur lent qui a tout juste bat un joueur rapide qui en rate une", () => {
    let p = nouvellePartie([A, B], [...THEMES], 20, 5, "fr", BANQUE, Math.random);
    for (let n = 1; n <= 5; n++) {
      const bonne = p.secret!.bonne;
      p = agir(p, "b", rep(n === 3 ? (bonne + 1) % 4 : bonne), [A, B], BANQUE, Math.random);
      p = avancer(p, 19_000, [A, B], BANQUE, Math.random);
      p = agir(p, "a", rep(bonne), [A, B], BANQUE, Math.random);
      expect(p.phase).toBe("bilan");
      if (n === 3) {
        expect(p.rompues).toEqual({ b: 2 });
      }
      p = avancer(p, BILAN_MS, [A, B], BANQUE, Math.random);
      p = avancer(p, THEME_MS, [A, B], BANQUE, Math.random);
    }
    expect(p.series).toEqual({ a: 5, b: 2 });
    // a : 5 × (50 + 1) + 15 + 30 + 45 + 60 ; b : 4 × 70 + 15 + 15.
    expect(p.scores).toEqual({ a: 405, b: 310 });
  });

  it("qui quitte le jeu perd la rapidité ; qui copie-colle ne marque rien et perd sa série", () => {
    let p = partie();
    const bonne = p.secret!.bonne;
    p = agir(
      p,
      "a",
      rep(bonne, { copie: true }),
      [A, B, C],
      BANQUE,
      Math.random,
    );
    p = agir(
      p,
      "b",
      rep(bonne, { absent: true }),
      [A, B, C],
      BANQUE,
      Math.random,
    );
    p = avancer(p, 10_000, [A, B, C], BANQUE, Math.random);
    p = agir(p, "c", rep(bonne), [A, B, C], BANQUE, Math.random);
    expect(p.reponses.a.vu).toBe("copie");
    expect(p.reponses.b.vu).toBe("absent");
    expect(p.scores).toEqual({ a: 0, b: 50, c: 60 });
    expect(p.series).toEqual({ a: 0, b: 1, c: 1 });
  });

  it("un meneur qui reprend sans la réponse annule la question, la partie continue", () => {
    const recue: PartieQuiz = publique(partie());
    const p = avancer(recue, 20_000, [A, B, C], BANQUE, Math.random);
    expect(p.phase).toBe("bilan");
    expect(p.solution).toBeNull();
    expect(avancer(p, BILAN_MS, [A, B, C], BANQUE, Math.random).phase).toBe(
      "theme",
    );
  });

  it("le départ de celui qui choisit fait tirer le thème au sort", () => {
    let p = partie();
    p = avancer(p, 20_000, [A, B, C], BANQUE, Math.random);
    p = avancer(p, BILAN_MS, [A, B, C], BANQUE, Math.random);
    const restent = [A, B, C].filter((j) => j.id !== p.choisit);
    p = presence(p, restent);
    expect(avancer(p, 0, restent, BANQUE, Math.random).phase).toBe("question");
  });
});
