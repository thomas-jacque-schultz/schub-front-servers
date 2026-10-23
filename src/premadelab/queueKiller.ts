// Un sous-domaine par mini-jeu (Schub#118), servi par ce front (games/<jeu>/index.html). Le dev se reconnaît à son
// sous-domaine, comme dans common/apps.ts ; le certificat gratuit ne couvre qu'un niveau, d'où dev-scribble.
export const JEUX = [
  "scribble",
  "zoom",
  "indices",
  "quiz",
  "imposteur",
] as const;

export type Jeu = (typeof JEUX)[number];

export const estJeu = (valeur: string | undefined): valeur is Jeu =>
  (JEUX as readonly string[]).includes(valeur ?? "");

const enDev =
  typeof window !== "undefined" && window.location.hostname.startsWith("dev.");

export const urlDuJeu = (jeu: Jeu): string =>
  `https://${enDev ? "dev-" : ""}${jeu}.premadelab.eu`;

export const origineDuJeu = (jeu: Jeu): string => new URL(urlDuJeu(jeu)).origin;

// La capacité d'un salon : max-players du relais (schub-together-games).
export const JOUEURS_MAX = 10;

// Chaque jeu a son champion (Schub#150) : Hwei peint, Vel'Koz observe, Caitlyn enquête, Heimerdinger sait tout,
// Neeko prend l'apparence des autres. Durées estimées aux réglages par défaut.
export const FICHES: Record<
  Jeu,
  { champion: string; joueursMin: number; minutes: number }
> = {
  scribble: { champion: "Hwei", joueursMin: 2, minutes: 8 },
  zoom: { champion: "Velkoz", joueursMin: 2, minutes: 5 },
  indices: { champion: "Caitlyn", joueursMin: 2, minutes: 10 },
  quiz: { champion: "Heimerdinger", joueursMin: 2, minutes: 10 },
  imposteur: { champion: "Neeko", joueursMin: 3, minutes: 15 },
};

// Sans version : Data Dragon sert les splashs et les vignettes du skin de base hors de tout patch.
const ILLUSTRATIONS = "https://ddragon.leagueoflegends.com/cdn/img/champion";

export const splashDuJeu = (jeu: Jeu): string =>
  `${ILLUSTRATIONS}/splash/${FICHES[jeu].champion}_0.jpg`;

export const vignetteDuJeu = (jeu: Jeu): string =>
  `${ILLUSTRATIONS}/tiles/${FICHES[jeu].champion}_0.jpg`;

export const CODE_SALON = /^[A-Z]{4}$/;
