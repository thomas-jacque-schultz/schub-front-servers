import type { MacroMapLandmark, MapPoint } from "../common";
import { lisElement, type ElementMesure, type Plan } from "./macro/plan";

// Les repères de la règle, en coordonnées du jeu. Deux sources, et aucune symétrie supposée : le rouge n'est pas le
// miroir exact du bleu (jusqu'à une centaine d'unités d'écart).
// - Tours et inhibiteurs : les positions des BUILDING_KILL des timelines collectées (riot_match_timeline), les
//   mêmes à l'unité près d'une partie à l'autre.
// - Fontaines, camps, carapateurs, Baron, Dragon : les points de la carte dans les fichiers du jeu (Community
//   Dragon, game/data/maps/shipping/map11/map11.bin.json : MapLocator), recoupés par les timelines pour la
//   fontaine bleue et le Baron. Un camp est pris à son premier point, les raptors au centre de leurs six.
// - Nexus : aucune source, position estimée.
export type RepereId =
  | "fountain"
  | "nexus"
  | "nexusTowerTop"
  | "nexusTowerBot"
  | "inhibTop"
  | "inhibMid"
  | "inhibBot"
  | "inhibTowerTop"
  | "innerTowerTop"
  | "outerTowerTop"
  | "inhibTowerMid"
  | "innerTowerMid"
  | "outerTowerMid"
  | "inhibTowerBot"
  | "innerTowerBot"
  | "outerTowerBot"
  | "blueBuff"
  | "gromp"
  | "wolves"
  | "raptors"
  | "redBuff"
  | "krugs"
  | "baron"
  | "dragon"
  | "scuttleTop"
  | "scuttleBot";

export interface Repere extends MacroMapLandmark {
  id: RepereId;
  approche?: boolean;
}

type Ligne = [RepereId, MacroMapLandmark["kind"], number, number];

const camp = (side: "blue" | "red", lignes: Ligne[]): Repere[] =>
  lignes.map(([id, kind, x, y]) => ({ id, kind, side, x, y }));

export const REPERES: readonly Repere[] = [
  ...camp("blue", [
    ["fountain", "fountain", 410, 422],
    ["nexusTowerTop", "tower", 1748, 2270],
    ["nexusTowerBot", "tower", 2177, 1807],
    ["inhibTop", "inhibitor", 1172, 3583],
    ["inhibMid", "inhibitor", 3210, 3217],
    ["inhibBot", "inhibitor", 3468, 1230],
    ["inhibTowerTop", "tower", 1169, 4287],
    ["innerTowerTop", "tower", 1512, 6699],
    ["outerTowerTop", "tower", 981, 10441],
    ["inhibTowerMid", "tower", 3651, 3696],
    ["innerTowerMid", "tower", 5048, 4812],
    ["outerTowerMid", "tower", 5846, 6396],
    ["inhibTowerBot", "tower", 4281, 1253],
    ["innerTowerBot", "tower", 6919, 1483],
    ["outerTowerBot", "tower", 10504, 1029],
    ["blueBuff", "camp", 3821, 7901],
    ["gromp", "camp", 2111, 8451],
    ["wolves", "camp", 3781, 6444],
    ["raptors", "camp", 6936, 5419],
    ["redBuff", "camp", 7765, 4020],
    ["krugs", "camp", 8482, 2706],
  ]),
  {
    id: "nexus",
    kind: "nexus",
    side: "blue",
    x: 1551,
    y: 1659,
    approche: true,
  },
  ...camp("red", [
    ["fountain", "fountain", 14298, 14384],
    ["nexusTowerTop", "tower", 12611, 13084],
    ["nexusTowerBot", "tower", 13052, 12612],
    ["inhibTop", "inhibitor", 11275, 13657],
    ["inhibMid", "inhibitor", 11593, 11669],
    ["inhibBot", "inhibitor", 13599, 11319],
    ["inhibTowerTop", "tower", 10481, 13650],
    ["innerTowerTop", "tower", 7943, 13411],
    ["outerTowerTop", "tower", 4318, 13875],
    ["inhibTowerMid", "tower", 11134, 11207],
    ["innerTowerMid", "tower", 9767, 10113],
    ["outerTowerMid", "tower", 8955, 8510],
    ["inhibTowerBot", "tower", 13624, 10572],
    ["innerTowerBot", "tower", 13327, 8226],
    ["outerTowerBot", "tower", 13866, 4505],
    ["blueBuff", "camp", 11032, 6991],
    ["gromp", "camp", 12704, 6444],
    ["wolves", "camp", 11008, 8387],
    ["raptors", "camp", 7868, 9557],
    ["redBuff", "camp", 7102, 10901],
    ["krugs", "camp", 6317, 12146],
  ]),
  {
    id: "nexus",
    kind: "nexus",
    side: "red",
    x: 13231,
    y: 13230,
    approche: true,
  },
  { id: "baron", kind: "objective", side: "neutral", x: 5007, y: 10471 },
  { id: "dragon", kind: "objective", side: "neutral", x: 9866, y: 4414 },
  { id: "scuttleTop", kind: "crab", side: "neutral", x: 4400, y: 9600 },
  { id: "scuttleBot", kind: "crab", side: "neutral", x: 10500, y: 5170 },
];

export const repereEn = (point: MapPoint) =>
  REPERES.find((repere) => repere.x === point.x && repere.y === point.y) ??
  null;

// Les distances de référence affichées sous la carte, et lues par les robots dans la page prérendue : des paires de
// repères, jamais des nombres écrits à la main.
export type GroupeDeTrajets = "lanes" | "fountain" | "objectives" | "jungle";
type Bout = [RepereId, Repere["side"]];

const TRAJETS: Record<GroupeDeTrajets, [Bout, Bout][]> = {
  lanes: [
    [
      ["outerTowerTop", "blue"],
      ["outerTowerTop", "red"],
    ],
    [
      ["outerTowerMid", "blue"],
      ["outerTowerMid", "red"],
    ],
    [
      ["outerTowerBot", "blue"],
      ["outerTowerBot", "red"],
    ],
    [
      ["fountain", "blue"],
      ["fountain", "red"],
    ],
  ],
  fountain: [
    [
      ["fountain", "blue"],
      ["outerTowerTop", "blue"],
    ],
    [
      ["fountain", "blue"],
      ["outerTowerMid", "blue"],
    ],
    [
      ["fountain", "blue"],
      ["outerTowerBot", "blue"],
    ],
    [
      ["fountain", "red"],
      ["outerTowerTop", "red"],
    ],
    [
      ["fountain", "red"],
      ["outerTowerMid", "red"],
    ],
    [
      ["fountain", "red"],
      ["outerTowerBot", "red"],
    ],
  ],
  objectives: [
    [
      ["baron", "neutral"],
      ["dragon", "neutral"],
    ],
    [
      ["fountain", "blue"],
      ["baron", "neutral"],
    ],
    [
      ["fountain", "blue"],
      ["dragon", "neutral"],
    ],
    [
      ["fountain", "red"],
      ["baron", "neutral"],
    ],
    [
      ["fountain", "red"],
      ["dragon", "neutral"],
    ],
  ],
  jungle: [
    [
      ["redBuff", "blue"],
      ["blueBuff", "blue"],
    ],
    [
      ["blueBuff", "blue"],
      ["scuttleTop", "neutral"],
    ],
    [
      ["redBuff", "blue"],
      ["scuttleBot", "neutral"],
    ],
    [
      ["redBuff", "red"],
      ["blueBuff", "red"],
    ],
    [
      ["blueBuff", "red"],
      ["scuttleBot", "neutral"],
    ],
    [
      ["redBuff", "red"],
      ["scuttleTop", "neutral"],
    ],
  ],
};

const trouver = ([id, side]: Bout): Repere => {
  const repere = REPERES.find(
    (candidat) => candidat.id === id && candidat.side === side,
  );
  if (!repere) {
    throw new Error(`repère inconnu : ${side}:${id}`);
  }
  return repere;
};

export const TRAJETS_DE_REFERENCE = (
  Object.entries(TRAJETS) as [GroupeDeTrajets, [Bout, Bout][]][]
).map(([groupe, paires]) => ({
  groupe,
  trajets: paires.map(([de, vers]) => ({
    de: trouver(de),
    vers: trouver(vers),
  })),
}));

export const PORTEES = [125, 400, 550, 600, 1000, 1200, 2000, 3000, 5500];
export const VITESSE_PAR_DEFAUT = 345;

// La clé de l'outil d'origine : une mesure faite avant le Macro Planner devient la première mesure du plan.
const ANCIENNE_CLE = "riftruler";

const MESURE_PAR_DEFAUT: ElementMesure = {
  id: "depart",
  type: "mesure",
  a: REPERES.find((repere) => repere.id === "outerTowerMid") ?? REPERES[0],
  b: REPERES.find((repere) => repere.id === "baron") ?? REPERES[0],
  r: 1000,
};

/** Le plan de /ruler à la première visite. */
export const planDeDepart = (): Plan => {
  try {
    const ancienne = lisElement({
      ...JSON.parse(localStorage.getItem(ANCIENNE_CLE) ?? "null"),
      id: "depart",
      type: "mesure",
    });
    if (ancienne) {
      return [ancienne];
    }
  } catch {
    // Stockage refusé ou contenu illisible : la mesure par défaut.
  }
  return [MESURE_PAR_DEFAUT];
};
