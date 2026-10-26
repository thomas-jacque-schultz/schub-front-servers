import type { Regles } from "../commun/useMeneur";
import {
  avancer,
  choisir,
  deviner,
  estPartie,
  type Partie,
  presence,
} from "./partie";

export const REGLES: Regles<Partie> = {
  estEtat: estPartie,
  enCours: (p) => p.phase !== "fin",
  avancer,
  deviner,
  presence,
  aDiffuser: (avant, apres) =>
    apres.phase !== avant.phase ||
    apres.tour !== avant.tour ||
    apres.revele.length !== avant.revele.length,
  // Le choix du mot, par le seul dessinateur.
  action: (p, de, valeur) =>
    de === p.dessinateur && typeof valeur === "number" ? choisir(p, valeur) : p,
};

/** Une nouvelle manche commence : le tableau de la précédente s'efface. */
export const nouvelleManche = (avant: Partie | null, apres: Partie | null) =>
  apres?.phase === "choix" &&
  (avant?.phase !== "choix" || avant.tour !== apres.tour);
