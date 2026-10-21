import { classes } from "../commun/ddragon";
import type { Lang } from "../commun/textes";
import { regionDe, univers } from "../commun/univers";
import type { Carte } from "./partie";

/** Sans Univers, la proximité ne tient qu'aux classes. */
export const cartes = async (
  lang: Lang,
): Promise<{ version: string; cartes: Carte[] }> => {
  const [lues, monde] = await Promise.all([
    classes(lang),
    univers(lang).catch(() => null),
  ]);
  return {
    version: lues.version,
    cartes: lues.champions.map((c) => ({
      ...c,
      region: regionDe(monde, c.nom),
    })),
  };
};
