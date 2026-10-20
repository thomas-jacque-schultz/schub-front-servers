import type { Schemas } from "../../../common";

export type Distribution = Schemas["ReferenceGridDistribution"];

/** Les métriques réparties par le connecteur (Schub#129) : kills et morts se comptent en entiers, le KDA par cases. */
export const REPARTIES = [
  { key: "deaths", field: "deathsPerGame", discrete: true },
  { key: "kills", field: "killsPerGame", discrete: true },
  { key: "kda", field: "kda", discrete: false },
] as const;

export type RepartieKey = (typeof REPARTIES)[number]["key"];

// Une répartition plus mince que la grille n'est pas montrée.
export const PARTIES_MINIMUM_REPARTITION = 200;

/**
 * La part des parties en dessous d'une valeur. Entière, une case vaut un nombre exact (6,1 morts dépasse les
 * parties à 6) ; continue, la case de la valeur est coupée au prorata.
 */
export const partEnDessous = (
  repartition: Distribution,
  valeur: number,
  discrete: boolean,
): number => {
  if (repartition.count === 0) {
    return 0;
  }
  const position = valeur / repartition.step;
  let dessous = 0;
  repartition.counts.forEach((compte, index) => {
    if (discrete) {
      dessous += index < position ? compte : 0;
    } else if (index + 1 <= position) {
      dessous += compte;
    } else if (index < position) {
      dessous += compte * (position - index);
    }
  });
  return dessous / repartition.count;
};

/** Le repère sur l'histogramme, en unités de barre : une case entière est centrée sur sa valeur. */
export const repereDe = (
  repartition: Distribution,
  valeur: number,
  discrete: boolean,
): number => valeur / repartition.step + (discrete ? 0.5 : 0);
