import type { Present } from "../commun/devinette";
import type { Regles } from "../commun/useMeneur";
import {
  agir,
  avancer,
  type Carte,
  estPartieImposteur,
  type PartieImposteur,
  presence,
} from "./partie";

export const creerRegles = (
  cartes: Carte[],
  presents: () => Present[],
): Regles<PartieImposteur> => {
  const noms = new Map(cartes.map((c) => [c.id, c.nom]));
  return {
    estEtat: estPartieImposteur,
    enCours: (p) => p.phase !== "fin",
    avancer: (p, ecouleMs, joueurs, hasard) =>
      avancer(p, ecouleMs, joueurs, cartes, hasard),
    deviner: (p) => ({ partie: p, proche: false }),
    presence,
    aDiffuser: (avant, apres) =>
      apres.phase !== avant.phase ||
      apres.manche !== avant.manche ||
      apres.tour !== avant.tour ||
      apres.parle !== avant.parle ||
      Object.keys(apres.votes).length !== Object.keys(avant.votes).length,
    action: (p, de, geste) =>
      agir(p, de, geste, presents(), (id) => noms.get(id) ?? ""),
  };
};
