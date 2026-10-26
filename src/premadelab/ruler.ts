import {
  MAP_SIZE,
  mirror,
  type MapPoint,
  type MapRulerLandmark,
} from "../common";

// Les repères de la règle, à des positions approchées. Le côté rouge est le miroir du bleu autour du centre :
// la tour extérieure top du bleu tombe sur la tour extérieure bot du rouge.
export type RepereId =
  | "fountain"
  | "nexus"
  | "nexusTowerTop"
  | "nexusTowerBot"
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

export interface Repere extends MapRulerLandmark {
  id: RepereId;
}

const BLEU: Omit<Repere, "side">[] = [
  { id: "fountain", kind: "fountain", x: 400, y: 420 },
  { id: "nexus", kind: "nexus", x: 1550, y: 1660 },
  { id: "nexusTowerTop", kind: "tower", x: 1748, y: 2270 },
  { id: "nexusTowerBot", kind: "tower", x: 2177, y: 1807 },
  { id: "inhibTowerTop", kind: "tower", x: 1169, y: 4287 },
  { id: "innerTowerTop", kind: "tower", x: 1512, y: 6699 },
  { id: "outerTowerTop", kind: "tower", x: 981, y: 10441 },
  { id: "inhibTowerMid", kind: "tower", x: 3651, y: 3696 },
  { id: "innerTowerMid", kind: "tower", x: 5048, y: 4812 },
  { id: "outerTowerMid", kind: "tower", x: 5846, y: 6396 },
  { id: "inhibTowerBot", kind: "tower", x: 4281, y: 1253 },
  { id: "innerTowerBot", kind: "tower", x: 6919, y: 1483 },
  { id: "outerTowerBot", kind: "tower", x: 10504, y: 1029 },
  { id: "blueBuff", kind: "camp", x: 3872, y: 7900 },
  { id: "gromp", kind: "camp", x: 2090, y: 8427 },
  { id: "wolves", kind: "camp", x: 3800, y: 6500 },
  { id: "raptors", kind: "camp", x: 6943, y: 5422 },
  { id: "redBuff", kind: "camp", x: 7765, y: 4020 },
  { id: "krugs", kind: "camp", x: 8482, y: 2705 },
];

const MIROIR_DU_NOM = (id: RepereId): RepereId =>
  id.endsWith("Top")
    ? (id.replace(/Top$/, "Bot") as RepereId)
    : id.endsWith("Bot")
      ? (id.replace(/Bot$/, "Top") as RepereId)
      : id;

const NEUTRES: Repere[] = [
  { id: "baron", kind: "objective", side: "neutral", x: 5007, y: 10471 },
  { id: "dragon", kind: "objective", side: "neutral", x: 9866, y: 4414 },
  { id: "scuttleTop", kind: "crab", side: "neutral", x: 4400, y: 9600 },
  { id: "scuttleBot", kind: "crab", side: "neutral", x: 10500, y: 5300 },
];

export const REPERES: readonly Repere[] = [
  ...BLEU.map((repere) => ({ ...repere, side: "blue" as const })),
  ...BLEU.map((repere) => ({
    ...repere,
    ...mirror(repere),
    id: MIROIR_DU_NOM(repere.id),
    side: "red" as const,
  })),
  ...NEUTRES,
];

export const repereEn = (point: MapPoint) =>
  REPERES.find((repere) => repere.x === point.x && repere.y === point.y) ??
  null;

export const PORTEES = [125, 400, 550, 600, 1000, 1200, 2000, 3000, 5500];
export const VITESSE_PAR_DEFAUT = 345;

// La clé de l'outil d'origine : une mesure faite avant l'intégration se retrouve.
const CLE = "riftruler";

export interface Mesure {
  a: MapPoint;
  b: MapPoint;
  r: number;
}

const MESURE_PAR_DEFAUT: Mesure = {
  a: REPERES.find((repere) => repere.id === "outerTowerMid") ?? REPERES[0],
  b: REPERES.find((repere) => repere.id === "baron") ?? REPERES[0],
  r: 1000,
};

const estPoint = (valeur: unknown): valeur is MapPoint =>
  typeof valeur === "object" &&
  valeur !== null &&
  [(valeur as MapPoint).x, (valeur as MapPoint).y].every(
    (n) => typeof n === "number" && n >= 0 && n <= MAP_SIZE,
  );

export const lireMesure = (): Mesure => {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) ?? "null");
    if (
      estPoint(brut?.a) &&
      estPoint(brut?.b) &&
      typeof brut.r === "number" &&
      brut.r > 0
    ) {
      return { a: brut.a, b: brut.b, r: brut.r };
    }
  } catch {
    // Stockage refusé ou contenu illisible : la mesure par défaut.
  }
  return MESURE_PAR_DEFAUT;
};

export const ecrireMesure = ({ a, b, r }: Mesure) => {
  try {
    localStorage.setItem(
      CLE,
      JSON.stringify({ a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y }, r }),
    );
  } catch {
    // Navigation privée ou quota plein : la mesure vit le temps de la page.
  }
};
