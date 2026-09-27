// Les deux applications vivent sur deux domaines : un lien de l'une à l'autre est une URL absolue.
// Le dev se reconnaît à son sous-domaine ; VITE_SCHUB_URL et VITE_PREMADELAB_URL priment (poste local).
const enDev =
  typeof window !== "undefined" && window.location.hostname.startsWith("dev.");

export const APP_URLS = {
  schub:
    import.meta.env.VITE_SCHUB_URL ??
    (enDev ? "https://dev.schultz-thomas.fr" : "https://schultz-thomas.fr"),
  premadelab:
    import.meta.env.VITE_PREMADELAB_URL ??
    (enDev ? "https://dev.premadelab.eu" : "https://premadelab.eu"),
} as const;
