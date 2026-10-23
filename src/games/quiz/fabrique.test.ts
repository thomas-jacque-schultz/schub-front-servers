import { describe, expect, it } from "vitest";
import type { ChampionComplet, Donnees } from "../commun/ddragon";
import {
  fabrique,
  formeDe,
  gammes,
  genreDe,
  type Lectures,
  masqueNom,
} from "./fabrique";

const ELLE = "Elle chasse. Elle gagne.";
const IL = "Il chasse. Il gagne.";

const champion = (
  id: string,
  histoire: string,
  skins: string[],
  nom = id,
): ChampionComplet => ({
  id,
  nom,
  titre: `titre de ${id}`,
  classes: ["Mage"],
  ressource: "Mana",
  aDistance: true,
  sorts: [],
  skins: skins.map((s, i) => ({ num: i + 1, nom: s })),
  histoire,
});

// Arcade : même forme pour tous ; Gardien des étoiles : accordée ; Sorcière : six membres, toutes féminines.
const SORCIERES = ["Ahri", "Lux", "Jinx", "Nami", "Lulu", "Zoe"];
const AUTRES = ["Sona", "Vex", "Neeko"];
const FEMININES = [...SORCIERES, ...AUTRES];
const MASCULINS = ["Garen", "Ezreal", "Teemo", "Zed", "Ryze", "Nasus"];
const fr = [
  ...FEMININES.map((id) =>
    champion(id, ELLE, [
      `${id} arcade`,
      `${id} gardienne des étoiles`,
      SORCIERES.includes(id) ? `${id} sorcière` : `${id}ette`,
    ]),
  ),
  ...MASCULINS.map((id) =>
    champion(id, IL, [
      `${id} arcade`,
      `${id} gardien des étoiles`,
      `${id}ator`,
    ]),
  ),
];
const en = [
  ...FEMININES.map((id) =>
    champion(id, ELLE, [
      `Arcade ${id}`,
      `Star Guardian ${id}`,
      SORCIERES.includes(id) ? `Bewitching ${id}` : `${id}ette`,
    ]),
  ),
  ...MASCULINS.map((id) =>
    champion(id, IL, [`Arcade ${id}`, `Star Guardian ${id}`, `${id}ator`]),
  ),
];
const donnees = (champions: ChampionComplet[]): Donnees => ({
  version: "16.21.1",
  champions,
  objets: [],
});
const LECTURES: Lectures = {
  date: "2026-10-23",
  fr: donnees(fr),
  en: donnees(en),
  univers: null,
};

describe("la fabrique du quiz", () => {
  it("l'histoire ne dit pas le nom du champion, même court", () => {
    expect(
      masqueNom("Kai'Sa est une enfant du Néant. Kai'Sa survit.", "Kai'Sa"),
    ).not.toMatch(/Kai/);
    expect(
      masqueNom("Jarvan IV règne. Jarvan chasse.", "Jarvan IV"),
    ).not.toMatch(/Jarvan/);
    expect(masqueNom("Vi frappe. Vi gagne.", "Vi")).not.toMatch(/\bVi\b/);
  });

  it("la gamme d'un skin se lit devant ou derrière le nom du champion", () => {
    expect(formeDe("Ahri arcade", "Ahri")).toEqual({
      forme: "arcade",
      avant: false,
    });
    expect(formeDe("K/DA Ahri", "Ahri")).toEqual({
      forme: "K/DA",
      avant: true,
    });
    expect(formeDe("Ahrithmétique", "Ahri")).toBeNull();
  });

  it("le genre d'un champion vient des pronoms de son histoire", () => {
    expect(genreDe(ELLE)).toBe("f");
    expect(genreDe(IL)).toBe("m");
  });

  it("une gamme accordée en genre n'est pas retenue ; une gamme toute féminine le dit", () => {
    const retenues = gammes(fr, en);
    expect(retenues.map((g) => g.cle).sort()).toEqual(["arcade", "bewitching"]);
    expect(retenues.find((g) => g.cle === "arcade")?.genres.sort()).toEqual([
      "f",
      "m",
    ]);
    expect(retenues.find((g) => g.cle === "bewitching")?.genres).toEqual(["f"]);
  });

  it("les questions sont bilingues, la bonne réponse en premier, et un faux skin est du genre de sa gamme", () => {
    const lot = fabrique(
      LECTURES,
      { objets: 0, histoire: 4, skins: 60, monde: 0 },
      Math.random,
    );
    const sorcieres = lot.filter((x) =>
      x.id.startsWith("skin-vrai-bewitching"),
    );
    expect(sorcieres.length).toBeGreaterThan(0);
    for (const q of lot) {
      expect(q.fr.choix).toHaveLength(4);
      expect(q.en.choix).toHaveLength(4);
    }
    for (const q of sorcieres) {
      for (const faux of q.fr.choix.slice(1)) {
        expect(AUTRES.some((id) => faux.startsWith(id))).toBe(true);
      }
    }
    const histoire = lot.find((q) => q.id.startsWith("histoire-"));
    expect(histoire?.fr.enonce).not.toContain(histoire?.fr.choix[0]);
  });

  it("aucune clé déjà en banque n'est refaite", () => {
    const premier = fabrique(
      LECTURES,
      { objets: 0, histoire: 6, skins: 0, monde: 0 },
      Math.random,
    );
    const second = fabrique(
      LECTURES,
      { objets: 0, histoire: 6, skins: 0, monde: 0 },
      Math.random,
      premier.map((q) => q.id),
    );
    expect(second.some((q) => premier.some((p) => p.id === q.id))).toBe(false);
  });
});
