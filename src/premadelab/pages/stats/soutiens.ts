import type { RolesDto } from "../../types/stats";
import { POSTES, type Poste } from "./statsFormat";

// En dessous, le résultat s'affiche avec le logo « confiance insuffisante » (Schub#105).
export const PARTIES_MINIMUM = 5;
export const OBJECTIFS_MINIMUM = 10;
export const COMBATS_MINIMUM = 5;

export const ligneDu = (roles: RolesDto, poste: Poste) =>
  roles.roles.find((r) => r.position === poste) ?? null;

export const paireDe = (roles: RolesDto, a: Poste, b: Poste) =>
  roles.pairs.find(
    (p) =>
      (p.position === a && p.matePosition === b) ||
      (p.position === b && p.matePosition === a),
  ) ?? null;

export interface Proche {
  poste: Poste;
  avant: number | null;
  apres: number | null;
}

// Les coéquipiers d'un poste, du plus proche au plus lointain après 15 min.
export function prochesDu(roles: RolesDto, poste: Poste): Proche[] {
  return POSTES.filter((autre) => autre !== poste)
    .map((autre) => {
      const paire = paireDe(roles, poste, autre);
      return {
        poste: autre,
        avant: paire?.earlyShare ?? null,
        apres: paire?.lateShare ?? null,
      };
    })
    .sort((x, y) => (y.apres ?? -1) - (x.apres ?? -1));
}

// Où passe le support après 15 min : son coéquipier le plus proche, ou seul s'il l'est plus souvent.
export function compagnonDuSupport(roles: RolesDto): Poste | "alone" | null {
  const premier = prochesDu(roles, "UTILITY")[0];
  const seul = ligneDu(roles, "UTILITY")?.lateAlone ?? null;
  if (!premier || premier.apres === null) {
    return seul === null ? null : "alone";
  }
  return seul !== null && seul > premier.apres ? "alone" : premier.poste;
}
