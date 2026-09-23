import { useMemo } from "react";
import { LANGUAGE_LOCALE } from "./config";
import { useCurrentLanguage } from "./navigation";

// Toujours la locale de la langue du site : sans locale explicite, Intl suit la machine du visiteur.
export const useLocaleFormat = () => {
  const language = useCurrentLanguage();
  const locale = LANGUAGE_LOCALE[language];

  return useMemo(() => {
    const time = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const dateTime = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    const month = new Intl.DateTimeFormat(locale, { month: "short" });
    const number = new Intl.NumberFormat(locale);

    return {
      locale,
      formatTime: (value: Date) => time.format(value),
      formatDateTime: (value: Date) => dateTime.format(value),
      formatNumber: (value: number) => number.format(value),
      formatDate: (value: Date) => date.format(value),
      formatMonth: (value: Date) => month.format(value),
    };
  }, [locale]);
};
