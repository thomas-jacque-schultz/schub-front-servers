import { useMemo } from "react";
import { LANGUAGE_LOCALE } from "./config";
import { useCurrentLanguage } from "./navigation";

/**
 * Dates, heures et nombres via `Intl`, jamais formatés à la main.
 *
 * <p>Un `toLocaleTimeString()` sans locale explicite suit la machine du visiteur, pas la langue
 * qu'il a choisie sur le site : on affichait donc une heure à l'anglaise sur une page française
 * selon le navigateur. Passer par la locale de la langue courante supprime cette dérive.</p>
 */
export const useLocaleFormat = () => {
  const language = useCurrentLanguage();
  const locale = LANGUAGE_LOCALE[language];

  return useMemo(() => {
    const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateTime = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
    const number = new Intl.NumberFormat(locale);

    return {
      locale,
      /** Heure seule — l'horodatage d'un rafraîchissement, par exemple. */
      formatTime: (value: Date) => time.format(value),
      /** Date et heure, pour une observation datée de plus de quelques minutes. */
      formatDateTime: (value: Date) => dateTime.format(value),
      formatNumber: (value: number) => number.format(value),
    };
  }, [locale]);
};
