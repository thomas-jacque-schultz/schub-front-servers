export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "fr";

export const LANGUAGE_PATH_PREFIX: Record<AppLanguage, string> = {
  fr: "",
  en: "/en",
};

export const LANGUAGE_LOCALE: Record<AppLanguage, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

export const isAppLanguage = (value: string): value is AppLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

export const languageFromPathname = (pathname: string): AppLanguage => {
  for (const language of SUPPORTED_LANGUAGES) {
    const prefix = LANGUAGE_PATH_PREFIX[language];
    if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return language;
    }
  }
  return DEFAULT_LANGUAGE;
};

export const pathWithoutLanguage = (pathname: string): string => {
  const prefix = LANGUAGE_PATH_PREFIX[languageFromPathname(pathname)];
  if (!prefix) {
    return pathname || "/";
  }
  const stripped = pathname.slice(prefix.length);
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
};

export const pathForLanguage = (pathname: string, language: AppLanguage): string => {
  const neutral = pathWithoutLanguage(pathname);
  const prefix = LANGUAGE_PATH_PREFIX[language];
  if (!prefix) {
    return neutral;
  }
  return neutral === "/" ? prefix : `${prefix}${neutral}`;
};

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
