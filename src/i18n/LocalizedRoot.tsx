import { type ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type AppLanguage, SUPPORTED_LANGUAGES, pathForLanguage } from "./config";

const HREFLANG_MARKER = "data-schub-hreflang";

export function LocalizedRoot({ language, children }: { language: AppLanguage; children: ReactNode }) {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language);
    }
    document.documentElement.lang = language;
  }, [i18n, language]);

  useEffect(() => {
    const head = document.head;
    head.querySelectorAll(`link[${HREFLANG_MARKER}]`).forEach((node) => node.remove());

    const origin = window.location.origin;
    const entries: Array<[string, string]> = SUPPORTED_LANGUAGES.map((candidate) => [
      candidate,
      `${origin}${pathForLanguage(location.pathname, candidate)}`,
    ]);
    entries.push(["x-default", `${origin}${pathForLanguage(location.pathname, "fr")}`]);

    for (const [hreflang, href] of entries) {
      const link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", hreflang);
      link.setAttribute("href", href);
      link.setAttribute(HREFLANG_MARKER, "");
      head.appendChild(link);
    }

    return () => {
      head.querySelectorAll(`link[${HREFLANG_MARKER}]`).forEach((node) => node.remove());
    };
  }, [location.pathname]);

  return <>{children}</>;
}
