import { describe, expect, it } from "vitest";
import type { ChampionComplet } from "../commun/ddragon";
import banque from "./banque.json";
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
  masqueNom,
  type QuestionBanque,
  type Sources,
  THEMES,
  themesDisponibles,
} from "./questions";

const A = { id: "a", name: "Ana" };
const B = { id: "b", name: "Bob" };
const C = { id: "c", name: "Cy" };
const champion = (
  id: string,
  classe: string,
  skins: number,
): ChampionComplet => ({
  id,
  nom: id,
  titre: `le titre de ${id}`,
  classes: [classe],
  ressource: "Mana",
  aDistance: true,
  sorts: [],
  skins,
  histoire: `${id} est né quelque part. ${id} a grandi ailleurs.`,
});
const NOMS = [
  "Ahri",
  "Lux",
  "Zed",
  "Garen",
  "Jinx",
  "Teemo",
  "Annie",
  "Ashe",
  "Darius",
  "Vayne",
  "Yasuo",
  "Akali",
  "Ezreal",
  "Fiora",
  "Irelia",
  "Karma",
  "Leona",
  "Nami",
  "Riven",
  "Sona",
  "Thresh",
  "Udyr",
  "Vi",
  "Zyra",
];
const SOURCES: Sources = {
  donnees: {
    version: "16.21.1",
    champions: NOMS.map((id, i) =>
      champion(id, i % 2 ? "Mage" : "Fighter", 5 + i),
    ),
    objets: Array.from({ length: 24 }, (_, i) => ({
      id: String(3000 + i),
      nom: `Objet ${i}`,
      prix: 1000 + i * 50,
      stats: [],
      composants: [`Composant ${i}`, `Composant ${i + 1}`],
      description: "",
    })),
  },
  univers: {
    regions: {
      ionia: "Ionia",
      demacia: "Demacia",
      noxus: "Noxus",
      zaun: "Zaun",
    },
    champions: NOMS.map((nom, i) => ({
      cle: nom.toLowerCase(),
      nom,
      region: ["ionia", "demacia", "noxus", "zaun"][i % 4],
      sortie: `${2009 + i}-01-01T00:00:00.000Z`,
    })),
  },
  banque: banque as QuestionBanque[],
};
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
    SOURCES,
    sequence([0.1, 0.7, 0.3, 0.9, 0.5]),
  );

describe("questions pour un invocateur", () => {
  it("la banque : chaque question a quatre choix distincts dans les deux langues, une date et une source", () => {
    for (const q of banque as QuestionBanque[]) {
      for (const lang of ["fr", "en"] as const) {
        expect(new Set(q[lang].choix).size).toBe(4);
        expect(q[lang].enonce && q[lang].explication).toBeTruthy();
      }
      expect(q.date).toMatch(/^\d{4}/);
      expect(q.source).toMatch(/^https:\/\//);
    }
  });

  it("chaque thème tient une partie de 15 questions sans doublon", () => {
    for (const theme of THEMES) {
      const posees: string[] = [];
      for (let i = 0; i < 15; i++) {
        const q = genere(theme, SOURCES, "fr", posees, Math.random);
        expect(q, `${theme} n°${i + 1}`).not.toBeNull();
        expect(new Set(q!.choix).size).toBe(4);
        expect(q!.choix[q!.bonne]).toBeTruthy();
        posees.push(q!.cle);
      }
    }
  }, 10_000);

  it("sans Univers, le thème Monde est retiré", () => {
    expect(themesDisponibles({ ...SOURCES, univers: null })).not.toContain(
      "monde",
    );
  });

  it("l'histoire ne dit pas le nom du champion", () => {
    expect(
      masqueNom("Kai'Sa est une enfant du Néant. Kai'Sa survit.", "Kai'Sa"),
    ).not.toMatch(/Kai/);
    expect(
      masqueNom("Jarvan IV règne. Jarvan chasse.", "Jarvan IV"),
    ).not.toMatch(/Jarvan/);
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
    p = agir(p, "b", bonne, [A, B, C], SOURCES, Math.random);
    p = avancer(p, 10_000, [A, B, C], SOURCES, Math.random);
    p = agir(p, "c", bonne, [A, B, C], SOURCES, Math.random);
    expect(agir(p, "c", fausse, [A, B, C], SOURCES, Math.random)).toBe(p);
    p = agir(p, "a", fausse, [A, B, C], SOURCES, Math.random);
    expect(p.phase).toBe("bilan");
    expect(p.solution?.bonne).toBe(bonne);
    expect(p.scores).toEqual({ a: 0, b: 100, c: 65 });
    p = avancer(p, BILAN_MS, [A, B, C], SOURCES, Math.random);
    expect(p.phase).toBe("theme");
    expect(p.choisit).toBe("b");
    expect(p.proposes).toHaveLength(3);
    const choisi = agir(p, "b", p.proposes[0], [A, B, C], SOURCES, Math.random);
    expect(choisi.phase).toBe("question");
    expect(choisi.theme).toBe(p.proposes[0]);
    expect(avancer(p, THEME_MS, [A, B, C], SOURCES, Math.random).phase).toBe(
      "question",
    );
  });

  it("si personne ne trouve, le joueur suivant dans l'ordre choisit", () => {
    let p = partie();
    p = avancer(p, 20_000, [A, B, C], SOURCES, Math.random);
    p = avancer(p, BILAN_MS, [A, B, C], SOURCES, Math.random);
    expect(p.choisit).toBe("a");
  });

  it("un meneur qui reprend sans la réponse annule la question, la partie continue", () => {
    const recue: PartieQuiz = publique(partie());
    const p = avancer(recue, 20_000, [A, B, C], SOURCES, Math.random);
    expect(p.phase).toBe("bilan");
    expect(p.solution).toBeNull();
    expect(avancer(p, BILAN_MS, [A, B, C], SOURCES, Math.random).phase).toBe(
      "theme",
    );
  });

  it("le départ de celui qui choisit fait tirer le thème au sort", () => {
    let p = partie();
    p = avancer(p, 20_000, [A, B, C], SOURCES, Math.random);
    p = avancer(p, BILAN_MS, [A, B, C], SOURCES, Math.random);
    p = presence(p, [B, C]);
    expect(avancer(p, 0, [B, C], SOURCES, Math.random).phase).toBe("question");
  });
});
