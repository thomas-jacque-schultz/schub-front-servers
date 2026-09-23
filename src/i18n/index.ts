import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, detectPreferredLanguage, languageFromPathname } from "./config";
import { defaultNS, namespaces, resources } from "./resources";

const initialLanguage =
  typeof window === "undefined"
    ? DEFAULT_LANGUAGE
    : languageFromPathname(window.location.pathname) === DEFAULT_LANGUAGE &&
        window.location.pathname === "/"
      ? detectPreferredLanguage()
      : languageFromPathname(window.location.pathname);

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  ns: namespaces,
  defaultNS,
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
