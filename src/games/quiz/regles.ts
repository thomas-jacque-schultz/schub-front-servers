import type { Present } from "../commun/devinette";
import type { Regles } from "../commun/useMeneur";
import {
  agir,
  avancer,
  estPartieQuiz,
  type PartieQuiz,
  presence,
  publique,
} from "./partie";
import type { Sources } from "./questions";

/** Les sources sont relues à chaque partie : la banque peut avoir changé dans Schub (Schub#137). */
export const creerRegles = (
  sources: () => Sources,
  presents: () => Present[],
): Regles<PartieQuiz> => ({
  estEtat: estPartieQuiz,
  enCours: (p) => p.phase !== "fin",
  avancer: (p, ecouleMs, joueurs, hasard) =>
    avancer(p, ecouleMs, joueurs, sources(), hasard),
  deviner: (p) => ({ partie: p, proche: false }),
  presence,
  aDiffuser: (avant, apres) =>
    apres.phase !== avant.phase ||
    apres.manche !== avant.manche ||
    Object.keys(apres.reponses).length !== Object.keys(avant.reponses).length,
  action: (p, de, valeur) =>
    agir(p, de, valeur, presents(), sources(), Math.random),
  publique,
});
