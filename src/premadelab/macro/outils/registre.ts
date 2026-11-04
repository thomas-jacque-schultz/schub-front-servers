import { feutre } from "./feutre";
import { ellipse, fleche, rectangle } from "./formes";
import { gomme } from "./gomme";
import { icones } from "./icones";
import { mesure } from "./mesure";
import type { CleOutil, Menu, Outil } from "./outil";

// Les outils du Macro Planner, dans l'ordre du panneau. Un outil neuf s'inscrit ici, et nulle part ailleurs.
export const OUTILS: readonly Outil[] = [
  mesure,
  feutre,
  fleche,
  rectangle,
  ellipse,
  gomme,
  icones,
];

export const MENUS: readonly Menu[] = ["mesure", "dessin", "icones"];

export const outilDe = (cle: CleOutil): Outil =>
  OUTILS.find((outil) => outil.cle === cle) ?? mesure;
