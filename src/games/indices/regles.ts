import type { Donnees } from "../commun/ddragon";
import type { Univers } from "../commun/univers";
import type { Regles } from "../commun/useMeneur";
import {
  avancer,
  choisir,
  deviner,
  devinerObjet,
  estPartieIndices,
  type PartieIndices,
  presence,
} from "./partie";

/**
 * Les règles lisent Data Dragon, et Univers pour la région d'un champion (null s'il ne répond pas) : le meneur, et
 * qui reprend après lui, construisent l'énigme de la manche.
 */
export const creerRegles = (
  donnees: Donnees,
  univers: Univers | null,
  presents: () => { id: string; name: string }[],
): Regles<PartieIndices> => ({
  estEtat: estPartieIndices,
  enCours: (p) => p.phase !== "fin",
  avancer: (p, ecouleMs, joueurs, hasard) =>
    avancer(p, ecouleMs, joueurs, donnees, univers, hasard),
  deviner,
  presence,
  aDiffuser: (avant, apres) =>
    apres.phase !== avant.phase ||
    apres.manche !== avant.manche ||
    apres.revele !== avant.revele,
  action: (p, de, valeur) => {
    const objet = (valeur as { objet?: unknown } | null)?.objet;
    return objet !== undefined
      ? devinerObjet(p, de, objet, donnees)
      : choisir(p, de, valeur, presents(), donnees, univers, Math.random);
  },
});
