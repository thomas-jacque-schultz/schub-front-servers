import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  type AppLanguage,
  LANGUAGE_PATH_PREFIX,
  isAppLanguage,
  languageFromPathname,
  pathForLanguage,
} from "./config";

/**
 * La langue de l'écran affiché.
 *
 * <p>Elle vient de l'URL, jamais d'un état React : c'est l'URL qui fait foi, sinon un lien
 * partagé ne s'ouvrirait pas dans la langue qu'il annonce.</p>
 */
export const useCurrentLanguage = (): AppLanguage => {
  const { pathname } = useLocation();
  return languageFromPathname(pathname);
};

/**
 * Le même chemin qu'on aurait écrit dans une application monolingue, préfixé de la langue
 * courante. `localize("/dashboard")` rend `/dashboard` en français, `/en/dashboard` en anglais.
 */
export const useLocalizedPath = (): ((path: string) => string) => {
  const language = useCurrentLanguage();
  return useCallback(
    (path: string) => {
      const prefix = LANGUAGE_PATH_PREFIX[language];
      if (!prefix) {
        return path;
      }
      const normalized = path.startsWith("/") ? path : `/${path}`;
      return normalized === "/" ? prefix : `${prefix}${normalized}`;
    },
    [language],
  );
};

/**
 * `navigate` qui reste dans la langue courante.
 *
 * <p>C'est ce qui permet aux écrans d'écrire `navigate("/dashboard")` sans jamais se soucier du
 * préfixe — la règle « une URL par langue » ne doit pas contaminer chaque appel de navigation.</p>
 */
export const useLocalizedNavigate = () => {
  const navigate = useNavigate();
  const localize = useLocalizedPath();

  return useCallback(
    (path: string, options?: { replace?: boolean }) => {
      navigate(localize(path), options);
    },
    [navigate, localize],
  );
};

/**
 * De quoi changer de langue sans quitter l'écran courant : la cible et le geste.
 *
 * <p>Changer la langue **change l'URL**, et `i18next` suit ensuite le chemin. L'inverse — un
 * sélecteur qui ne toucherait qu'à l'état — laisserait les deux versions sur la même adresse.</p>
 */
export const useLanguageSwitcher = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const current = languageFromPathname(location.pathname);

  const switchTo = useCallback(
    (language: AppLanguage) => {
      if (!isAppLanguage(language) || language === current) {
        return;
      }
      navigate(
        {
          pathname: pathForLanguage(location.pathname, language),
          search: location.search,
          hash: location.hash,
        },
        { replace: true },
      );
    },
    [current, location.hash, location.pathname, location.search, navigate],
  );

  return useMemo(
    () => ({ current, switchTo, resolvedLanguage: i18n.resolvedLanguage }),
    [current, switchTo, i18n.resolvedLanguage],
  );
};
