// Un sous-domaine par mini-jeu (Schub#118). Le dev se reconnaît à son sous-domaine, comme dans common/apps.ts ;
// le certificat gratuit ne couvre qu'un niveau, d'où dev-scribble et non scribble.dev.
const enDev =
  typeof window !== "undefined" && window.location.hostname.startsWith("dev.");

export const SCRIBBLE_URL =
  import.meta.env.VITE_SCRIBBLE_URL ??
  (enDev
    ? "https://dev-scribble.premadelab.eu"
    : "https://scribble.premadelab.eu");

export const SCRIBBLE_ORIGIN = new URL(SCRIBBLE_URL).origin;
