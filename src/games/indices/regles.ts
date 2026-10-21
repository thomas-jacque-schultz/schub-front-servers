import type { Donnees } from "../commun/ddragon";
import type { Regles } from "../commun/useMeneur";
import {
  avancer,
  choisir,
  deviner,
  estPartieIndices,
  type PartieIndices,
  presence,
} from "./partie";

/** Les règles lisent Data Dragon : le meneur, et qui reprend après lui, construisent l'énigme de la manche. */
export const creerRegles = (
  donnees: Donnees,
  presents: () => { id: string; name: string }[],
): Regles<PartieIndices> => ({
  estEtat: estPartieIndices,
  enCours: (p) => p.phase !== "fin",
  avancer: (p, ecouleMs, joueurs, hasard) =>
    avancer(p, ecouleMs, joueurs, donnees, hasard),
  deviner,
  presence,
  aDiffuser: (avant, apres) =>
    apres.phase !== avant.phase ||
    apres.manche !== avant.manche ||
    apres.revele !== avant.revele,
  action: (p, de, valeur) =>
    choisir(p, de, valeur, presents(), donnees, Math.random),
});
