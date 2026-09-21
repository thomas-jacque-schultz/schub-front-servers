import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocaleFormat } from "../../../i18n/format";
import type { StatsCoverageDto } from "../../../types/stats";

/**
 * Les modes de jeu nommés par le connecteur, qui les tire de la liste officielle de Riot. Le
 * cœur ne sert plus de `queueId` sur ces clés : plusieurs identifiants désignent le même mode.
 */
const MODES = [
  "RANKED_SOLO",
  "RANKED_FLEX",
  "NORMAL_DRAFT",
  "NORMAL_BLIND",
  "QUICKPLAY",
  "SWIFTPLAY",
  "ARAM",
  "ARAM_MAYHEM",
  "CLASH",
  "ARAM_CLASH",
  "COOP_VS_AI",
  "ARURF",
  "URF",
  "ONE_FOR_ALL",
  "NEXUS_BLITZ",
  "ULTIMATE_SPELLBOOK",
  "ARENA",
  "SWARM",
  "BRAWL",
  "TUTORIAL",
  "CUSTOM",
  "OTHER",
] as const;

type Mode = (typeof MODES)[number];

const POSTES = [
  "TOP",
  "JUNGLE",
  "MIDDLE",
  "BOTTOM",
  "UTILITY",
  "UNKNOWN",
] as const;

type Poste = (typeof POSTES)[number];

/**
 * La mise en forme commune aux trois écrans.
 *
 * <p>Tout ce qui est nul rend un tiret, jamais un zéro : « pas de chiffre » et « zéro » sont deux
 * réponses différentes, et les confondre invente une donnée.</p>
 */
export const useStatsFormat = () => {
  const { t } = useTranslation("stats");
  const { locale, formatNumber, formatDate } = useLocaleFormat();

  return useMemo(() => {
    const pourcent = new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 0,
    });
    const decimal = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    const absent = "—";

    const points = (value: number | null | undefined) =>
      value === null || value === undefined ? null : Math.round(value * 100);

    return {
      absent,
      taux: (value: number | null | undefined) =>
        value === null || value === undefined ? absent : pourcent.format(value),
      ratio: (value: number | null | undefined) =>
        value === null || value === undefined ? absent : decimal.format(value),
      entier: (value: number | null | undefined) =>
        value === null || value === undefined
          ? absent
          : formatNumber(Math.round(value)),
      /** Un écart de taux se dit en points, pas en pourcent : 54 % contre 41 % font 13 points. */
      ecartEnPoints: (value: number | null | undefined) => {
        const valeur = points(value);
        if (valeur === null) {
          return null;
        }
        return t("delta.points", {
          value: valeur > 0 ? `+${valeur}` : `${valeur}`,
        });
      },
      ecartRatio: (value: number | null | undefined) => {
        if (value === null || value === undefined) {
          return null;
        }
        const signe = value > 0 ? "+" : "";
        return `${signe}${decimal.format(value)}`;
      },
      tonDeLEcart: (value: number | null | undefined) => {
        if (value === null || value === undefined || Math.abs(value) < 1e-9) {
          return "neutral" as const;
        }
        return value > 0 ? ("positive" as const) : ("negative" as const);
      },
      duree: (secondes: number | null | undefined) => {
        if (secondes === null || secondes === undefined) {
          return absent;
        }
        return t("duration.minutes", { count: Math.round(secondes / 60) });
      },
      /**
       * Le nom du mode de jeu. Un mode que cette version ne connaît pas rend « autre mode »
       * plutôt qu'une clé brute : Riot en ajoute, et l'écran doit rester lisible.
       */
      file: (mode: string | null | undefined) => {
        const cle: Mode =
          mode && (MODES as readonly string[]).includes(mode) ? (mode as Mode) : "OTHER";
        return t(`queue.${cle}`);
      },
      poste: (position: string | null | undefined) => {
        const cle: Poste =
          position && (POSTES as readonly string[]).includes(position)
            ? (position as Poste)
            : "UNKNOWN";
        return t(`position.${cle}`);
      },
      cote: (side: number) => t(side === 200 ? "side.red" : "side.blue"),
      /**
       * Sur quoi porte un chiffre : le nombre de parties et la période. Sans cette phrase, trois
       * parties et trois cents se lisent pareil.
       */
      assise: (coverage: StatsCoverageDto | null | undefined) => {
        if (!coverage) {
          return null;
        }
        const debut = coverage.firstPlayedAt
          ? formatDate(new Date(coverage.firstPlayedAt))
          : null;
        const fin = coverage.lastPlayedAt
          ? formatDate(new Date(coverage.lastPlayedAt))
          : null;
        if (debut && fin) {
          return t("coverage.gamesAndPeriod", {
            count: coverage.games,
            from: debut,
            to: fin,
          });
        }
        return t("coverage.games", { count: coverage.games });
      },
      periode: (from: string | null, to: string | null) => {
        if (!from || !to) {
          return null;
        }
        return t("coverage.period", {
          from: formatDate(new Date(from)),
          to: formatDate(new Date(to)),
        });
      },
    };
  }, [locale, formatDate, formatNumber, t]);
};
