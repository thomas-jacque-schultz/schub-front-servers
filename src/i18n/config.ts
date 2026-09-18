/**
 * Configuration des langues : la liste, leur préfixe d'URL, et les fonctions qui font le
 * va-et-vient entre un chemin et la langue qu'il désigne.
 *
 * <p>Le site est bilingue avec **une URL par langue** — `/` en français, `/en/…` en anglais
 * (décision n°17 du plan). Un sélecteur qui ne changerait pas l'URL rendrait la version anglaise
 * invisible pour les moteurs de recherche, ce qui n'est pas tenable pour la racine d'un
 * portfolio.</p>
 */

export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Le français est la langue par défaut : c'est elle qui occupe la racine du site. */
export const DEFAULT_LANGUAGE: AppLanguage = "fr";

/** Le préfixe de chemin de chaque langue. Le français n'en a pas, par construction. */
export const LANGUAGE_PATH_PREFIX: Record<AppLanguage, string> = {
  fr: "",
  en: "/en",
};

/** La locale BCP 47 utilisée par `Intl` pour les dates et les nombres. */
export const LANGUAGE_LOCALE: Record<AppLanguage, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

/** Vrai si la chaîne est une langue que le site sait servir. */
export const isAppLanguage = (value: string): value is AppLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

/**
 * La langue désignée par un chemin. Tout ce qui ne commence pas par un préfixe connu est
 * français, y compris `/`.
 */
export const languageFromPathname = (pathname: string): AppLanguage => {
  for (const language of SUPPORTED_LANGUAGES) {
    const prefix = LANGUAGE_PATH_PREFIX[language];
    if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return language;
    }
  }
  return DEFAULT_LANGUAGE;
};

/** Le même chemin, débarrassé de son préfixe de langue. `/en/dashboard` → `/dashboard`. */
export const pathWithoutLanguage = (pathname: string): string => {
  const prefix = LANGUAGE_PATH_PREFIX[languageFromPathname(pathname)];
  if (!prefix) {
    return pathname || "/";
  }
  const stripped = pathname.slice(prefix.length);
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
};

/**
 * Le chemin équivalent dans une autre langue. C'est ce qui permet au sélecteur de langue de
 * rester sur l'écran courant au lieu de renvoyer à l'accueil.
 */
export const pathForLanguage = (pathname: string, language: AppLanguage): string => {
  const neutral = pathWithoutLanguage(pathname);
  const prefix = LANGUAGE_PATH_PREFIX[language];
  if (!prefix) {
    return neutral;
  }
  return neutral === "/" ? prefix : `${prefix}${neutral}`;
};

/**
 * La langue à servir au tout premier passage, quand aucune URL ne la porte : la préférence du
 * navigateur si le site la parle, le français sinon.
 */
export const detectPreferredLanguage = (): AppLanguage => {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANGUAGE;
  }
  for (const candidate of navigator.languages ?? [navigator.language]) {
    const base = candidate?.split("-")[0]?.toLowerCase();
    if (base && isAppLanguage(base)) {
      return base;
    }
  }
  return DEFAULT_LANGUAGE;
};
