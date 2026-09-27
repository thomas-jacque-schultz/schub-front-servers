import { useTranslation } from "react-i18next";
import type { RadarReferencesDto, StatLineDto } from "../../types/stats";
import type { MetricKey } from "./metrics";
import { SOMME_NULLE, useMetrics } from "./metrics";
import { useStatsFormat } from "./statsFormat";
import { useGrades } from "./useGrades";

const PARTIES_PAR_MOIS = 5;

/** Une phrase de conclusion par indicateur : face à son palier, ou face à soi-même pour un écart à somme nulle. */
export const useKpiSentence = (
  references: RadarReferencesDto | null | undefined,
  positions: StatLineDto[],
  months: StatLineDto[],
) => {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { definitions } = useMetrics();
  const grades = useGrades(references, positions);

  return (key: MetricKey): string | undefined => {
    if (SOMME_NULLE.includes(key)) {
      const mois = [...months]
        .filter((m) => m.laningGames >= PARTIES_PAR_MOIS && m[key] !== null)
        .sort((a, b) => a.key.localeCompare(b.key))
        .slice(-2);
      if (mois.length < 2) {
        return undefined;
      }
      const [avant, maintenant] = mois.map((m) => m[key] as number);
      const ecart = maintenant - avant;
      const cle =
        Math.abs(ecart) < Math.abs(avant || 1) * 0.1
          ? "stable"
          : ecart > 0
            ? "up"
            : "down";
      return t(`conclusion.trend.${cle}`, {
        now: definitions[key].format(maintenant),
        before: definitions[key].format(avant),
      });
    }
    const note = grades.grade(key);
    if (!note || note.inTier === null || !references?.tier) {
      return undefined;
    }
    const part = Math.round(note.inTier * 100);
    const contexte = {
      tier: t(`tier.${references.tier}`, { defaultValue: references.tier }),
      position: format.poste(references.position),
    };
    return part >= 50
      ? t("conclusion.better", { part, ...contexte })
      : t("conclusion.worse", { part: 100 - part, ...contexte });
  };
};
