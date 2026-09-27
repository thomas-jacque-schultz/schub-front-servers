import { useTranslation } from "react-i18next";
import { useCurrentLanguage } from "../../common";
import { useStatsFormat } from "../pages/stats/statsFormat";
import type { FindingDto } from "../types/findings";

const REFERENCE = /\{([A-Za-z0-9]+)\.(value|percentile)\}|\{(position|tier)\}/g;

/** La phrase d'un constat, dont les trous se remplissent avec sa propre preuve. */
export const useFindingSentence = () => {
  const { t } = useTranslation("stats");
  const langue = useCurrentLanguage();
  const format = useStatsFormat();

  return (finding: FindingDto) => {
    const gabarit = finding.sentence[langue] ?? finding.sentence.fr ?? "";
    return gabarit.replace(
      REFERENCE,
      (_, signal: string, champ: string, contexte: string) => {
        if (contexte === "position") {
          const poste = finding.context.position ?? "";
          return t(`position.${poste}`, { defaultValue: poste });
        }
        if (contexte === "tier") {
          const palier = finding.context.tier ?? "";
          return t(`tier.${palier}`, { defaultValue: palier });
        }
        const preuve = finding.evidence.find(
          (condition) => condition.signal === signal,
        );
        if (!preuve || preuve.observed === null) {
          return format.absent;
        }
        if (champ === "percentile" || preuve.unit === "PERCENTILE") {
          return format.entier(preuve.observed);
        }
        return Math.abs(preuve.observed) >= 100
          ? format.entier(preuve.observed)
          : format.ratio(preuve.observed);
      },
    );
  };
};
