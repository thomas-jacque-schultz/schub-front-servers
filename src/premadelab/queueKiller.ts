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

/** Ce que montre la jaquette : le pictogramme (le même que dans le jeu), le minimum de joueurs, une durée de partie
 *  aux réglages par défaut, et la teinte de sa lueur (un rang de playful.confetti). */
export const FICHES: Record<
  Jeu,
  { icone: string; joueursMin: number; minutes: number; teinte: number }
> = {
  scribble: { icone: "🎨", joueursMin: 2, minutes: 8, teinte: 0 },
  zoom: { icone: "🔍", joueursMin: 2, minutes: 5, teinte: 2 },
  indices: { icone: "🕵️", joueursMin: 2, minutes: 10, teinte: 4 },
  quiz: { icone: "🧠", joueursMin: 2, minutes: 10, teinte: 1 },
  imposteur: { icone: "🎭", joueursMin: 3, minutes: 15, teinte: 3 },
};

export const CODE_SALON = /^[A-Z]{4}$/;
