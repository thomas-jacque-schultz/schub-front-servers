import type { Regles } from "../commun/useMeneur";
import {
  avancer,
  deviner,
  estPartieZoom,
  type PartieZoom,
  presence,
} from "./partie";

export const REGLES: Regles<PartieZoom> = {
  estEtat: estPartieZoom,
  enCours: (p) => p.phase !== "fin",
  avancer,
  deviner,
  presence,
  aDiffuser: (avant, apres) =>
    apres.phase !== avant.phase || apres.manche !== avant.manche,
};
