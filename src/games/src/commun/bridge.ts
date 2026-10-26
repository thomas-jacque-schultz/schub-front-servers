import type { Lang } from "./textes";

// Le contrat avec la page hôte (PremadeLab), réduit à deux messages (Schub#119) :
//   hôte → jeu : { type: "premadelab:init", room: string | null, lang: "fr" | "en" }
//   jeu → hôte : { type: "premadelab:room", room: string }
// Tout message d'une autre origine est ignoré.
const HOTES = ["https://premadelab.eu", "https://dev.premadelab.eu"];

export interface Init {
  room: string | null;
  lang: Lang;
  origin: string;
}

export const dansUnHote = (): boolean => window.parent !== window;

const hoteAutorise = (origin: string) =>
  HOTES.includes(origin) ||
  (import.meta.env.DEV && origin.startsWith("http://localhost:"));

// Écouté dès le chargement du module : l'hôte envoie l'init à l'événement load de l'iframe.
const init = new Promise<Init>((resolve) => {
  window.addEventListener("message", (event: MessageEvent) => {
    const data = event.data as {
      type?: unknown;
      room?: unknown;
      lang?: unknown;
    } | null;
    if (!hoteAutorise(event.origin) || data?.type !== "premadelab:init") {
      return;
    }
    resolve({
      room:
        typeof data.room === "string" && /^[A-Z]{4}$/.test(data.room)
          ? data.room
          : null,
      lang: data.lang === "en" ? "en" : "fr",
      origin: event.origin,
    });
  });
});

export const attendInit = (): Promise<Init> => init;

export const annonceSalon = (room: string, origin: string) => {
  window.parent.postMessage({ type: "premadelab:room", room }, origin);
};
