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
