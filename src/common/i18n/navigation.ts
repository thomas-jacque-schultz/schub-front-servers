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

export const useCurrentLanguage = (): AppLanguage => {
  const { pathname } = useLocation();
  return languageFromPathname(pathname);
};

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
