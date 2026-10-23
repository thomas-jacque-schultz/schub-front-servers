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

  it("plus tôt vaut plus ; le plus rapide à avoir trouvé choisit le thème suivant", () => {
    let p = partie();
    const bonne = p.secret!.bonne;
    const fausse = (bonne + 1) % 4;
    p = agir(p, "b", bonne, [A, B, C], BANQUE, Math.random);
    p = avancer(p, 10_000, [A, B, C], BANQUE, Math.random);
    p = agir(p, "c", bonne, [A, B, C], BANQUE, Math.random);
    expect(agir(p, "c", fausse, [A, B, C], BANQUE, Math.random)).toBe(p);
    p = agir(p, "a", fausse, [A, B, C], BANQUE, Math.random);
    expect(p.phase).toBe("bilan");
    expect(p.solution?.bonne).toBe(bonne);
    expect(p.scores).toEqual({ a: 0, b: 100, c: 65 });
    p = avancer(p, BILAN_MS, [A, B, C], BANQUE, Math.random);
    expect(p.phase).toBe("theme");
    expect(p.choisit).toBe("b");
    expect(p.proposes).toHaveLength(3);
    const choisi = agir(p, "b", p.proposes[0], [A, B, C], BANQUE, Math.random);
    expect(choisi.phase).toBe("question");
    expect(choisi.theme).toBe(p.proposes[0]);
    expect(avancer(p, THEME_MS, [A, B, C], BANQUE, Math.random).phase).toBe(
      "question",
    );
  });

  it("si personne ne trouve, le joueur suivant dans l'ordre choisit", () => {
    let p = partie();
    p = avancer(p, 20_000, [A, B, C], BANQUE, Math.random);
    p = avancer(p, BILAN_MS, [A, B, C], BANQUE, Math.random);
    expect(p.choisit).toBe("a");
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
    p = presence(p, [B, C]);
    expect(avancer(p, 0, [B, C], BANQUE, Math.random).phase).toBe("question");
  });
});
