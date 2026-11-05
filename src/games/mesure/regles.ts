import type { Regles } from "../commun/useMeneur";
import {
  action,
  avancer,
  estPartieMesure,
  type PartieMesure,
  presence,
} from "./partie";

export const REGLES: Regles<PartieMesure> = {
  estEtat: estPartieMesure,
  enCours: (p) => p.phase !== "fin",
  avancer,
  deviner: (p) => ({ partie: p, proche: false }),
  presence,
  action,
  aDiffuser: (avant, apres) =>
    apres.phase !== avant.phase || apres.manche !== avant.manche,
};
