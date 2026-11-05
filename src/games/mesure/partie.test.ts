import { describe, expect, it } from "vitest";
import {
  action,
  avancer,
  BILAN_MS,
  HAUTEUR_ETALON,
  HAUTEUR_MAX,
  HAUTEUR_MIN,
  hauteurJuste,
  nouvellePartie,
  pointsDe,
  presence,
} from "./partie";

const A = { id: "a", name: "Ana" };
const B = { id: "b", name: "Bob" };
const CHAMPIONS = [
  { id: "Teemo", nom: "Teemo" },
  { id: "Darius", nom: "Darius" },
  { id: "Annie", nom: "Annie" },
  { id: "Sion", nom: "Sion" },
  { id: "ChampionInconnu", nom: "?" },
];
const premier = () => 0;
const partie = (manches = 2) =>
  nouvellePartie([A, B], 30, manches, "fr", CHAMPIONS, premier);

describe("la juste mesure", () => {
  it("un champion sans taille connue n'est jamais tiré", () => {
    expect(partie().reserve.map((c) => c.id)).not.toContain("ChampionInconnu");
  });

  it("la bonne hauteur tient dans la scène, et le curseur part loin d'elle", () => {
    const p = partie();
    const juste = hauteurJuste(p.etalon!, p.cible!);
    expect(juste).toBeLessThanOrEqual(HAUTEUR_MAX);
    expect(juste).toBeGreaterThanOrEqual(HAUTEUR_MIN);
    expect(Math.abs(Math.log(p.depart / juste))).toBeGreaterThan(Math.log(1.4));
    expect(p.depart).toBeLessThanOrEqual(HAUTEUR_MAX);
    expect(p.depart).toBeGreaterThanOrEqual(HAUTEUR_MIN);
  });

  it("les points suivent l'écart, de 100 à 0, dans les deux sens", () => {
    expect(pointsDe(0.5, 0.5)).toBe(100);
    expect(pointsDe(0.5 * 1.75, 0.5)).toBe(0);
    expect(pointsDe(0.5 / 1.75, 0.5)).toBe(0);
    expect(pointsDe(0.6, 0.5)).toBe(pointsDe(0.5 / 1.2, 0.5));
  });

  it("une réponse se règle tant qu'elle n'est pas validée, et la dernière validation clôt la manche", () => {
    let p = partie();
    const juste = hauteurJuste(p.etalon!, p.cible!);
    p = action(p, "a", { choix: 0.2 }, false);
    expect(p.choix.a).toBe(0.2);
    p = action(p, "a", { choix: juste, valide: true }, false);
    expect(p.valides).toEqual(["a"]);
    const figee = action(p, "a", { choix: 0.2 }, false);
    expect(figee.choix.a).toBe(juste);
    p = action(p, "b", { choix: juste * 2, valide: true }, false);
    expect(p.phase).toBe("bilan");
    expect(p.resultats.a.points).toBe(100);
    expect(p.resultats.b.points).toBe(0);
    expect(p.scores.a).toBe(100);
  });

  it("refuse une hauteur hors de la scène", () => {
    const p = partie();
    expect(action(p, "a", { choix: 5 }, false)).toBe(p);
    expect(action(p, "a", { choix: "x" }, false)).toBe(p);
    expect(action(p, "z", { choix: 0.5 }, false)).toBe(p);
  });

  it("à la fin du chrono, qui n'a pas touché au curseur répond sa position de départ", () => {
    const p = avancer(partie(), 30_000, [A, B], premier);
    expect(p.phase).toBe("bilan");
    expect(p.resultats.a.choix).toBe(p.depart);
    expect(p.restantMs).toBe(BILAN_MS);
  });

  it("le bilan passe à la manche suivante, puis à la fin", () => {
    let p = avancer(partie(2), 30_000, [A, B], premier);
    p = avancer(p, BILAN_MS, [A, B], premier);
    expect(p.manche).toBe(2);
    expect(p.phase).toBe("manche");
    expect(p.choix).toEqual({});
    p = avancer(avancer(p, 30_000, [A, B], premier), BILAN_MS, [A, B], premier);
    expect(p.phase).toBe("fin");
  });

  it("le meneur peut écourter un bilan", () => {
    const p = avancer(partie(), 30_000, [A, B], premier);
    expect(action(p, "b", { suite: true }, false).restantMs).toBe(BILAN_MS);
    expect(action(p, "a", { suite: true }, true).restantMs).toBe(0);
  });

  it("se joue seul", () => {
    const p = nouvellePartie([A], 30, 2, "fr", CHAMPIONS, premier);
    expect(p.phase).toBe("manche");
    expect(
      action(p, "a", { choix: HAUTEUR_ETALON, valide: true }, false).phase,
    ).toBe("bilan");
  });

  it("le départ du dernier qui réglait clôt la manche", () => {
    let p = action(partie(), "a", { choix: 0.5, valide: true }, false);
    p = presence(p, [A]);
    expect(p.phase).toBe("bilan");
    expect(p.resultats.b).toBeUndefined();
  });
});
