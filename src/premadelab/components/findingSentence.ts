import { useTranslation } from "react-i18next";
import { useCurrentLanguage } from "../../common";
import { useStatsFormat } from "../pages/stats/statsFormat";
import type { FindingDto } from "../types/findings";

// {signal.value}, {signal.percentile}, {signal.points} (un écart en points de pourcentage), ou {cle} du contexte.
const REFERENCE =
  /\{([A-Za-z0-9]+)\.(value|percentile|points)\}|\{([A-Za-z]+)\}/g;
const POSTES = ["position", "resourcePosition"];

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
        if (contexte) {
          const valeur = finding.context[contexte] ?? "";
          if (POSTES.includes(contexte)) {
            return t(`position.${valeur}`, { defaultValue: valeur });
          }
          if (contexte === "tier") {
            return t(`tier.${valeur}`, { defaultValue: valeur });
          }
          return valeur;
        }
        const preuve = finding.evidence.find(
          (condition) => condition.signal === signal,
        );
        if (!preuve) {
          return format.absent;
        }
        const enCentile = preuve.unit === "PERCENTILE";
        if (champ === "percentile") {
          return enCentile && preuve.observed !== null
            ? format.entier(preuve.observed)
            : format.absent;
        }
        const mesure =
          champ === "points" || !enCentile
            ? (preuve.value ?? preuve.observed)
            : preuve.value;
        if (mesure === null || mesure === undefined) {
          return format.absent;
        }
        if (champ === "points") {
          return format.entier(Math.abs(mesure) * 100);
        }
        return Math.abs(mesure) >= 100
          ? format.entier(mesure)
          : format.ratio(mesure);
      },
    );
  };
};
