import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, detectPreferredLanguage, languageFromPathname } from "./config";
import { defaultNS, namespaces, resources } from "./resources";

/**
 * Initialisation d'i18next.
 *
 * <p>La langue de départ est celle que porte l'URL. Sur la racine — qui ne porte aucun préfixe —
 * on retombe sur la préférence du navigateur, mais sans rediriger : `/` reste `/` et reste
 * française pour les moteurs de recherche, seul l'affichage suit le visiteur.</p>
 *
 * <p>Les catalogues sont embarqués dans le bundle plutôt que chargés par HTTP : à deux langues et
 * cinq domaines, le poids est négligeable et cela supprime un état de chargement à gérer dans
 * chaque écran.</p>
 */
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
    // React échappe déjà ce qu'il affiche ; le faire une seconde fois casserait les apostrophes.
    escapeValue: false,
  },
});

export default i18n;
