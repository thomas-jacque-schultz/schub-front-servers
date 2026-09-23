import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { RadarReferencesDto, StatLineDto } from "../../../types/stats";
import { noter, repartition } from "./grading";
import { PercentileMark } from "./LevelCrest";
import type { MetricKey } from "./metrics";
import { useStatsFormat } from "./statsFormat";
import { useChampionGrid } from "./useChampionGrid";
import { useReferenceGrid } from "./useReferenceGrid";

const PARTIES_MINIMUM = 5;

/**
 * Un champion se compare aux joueurs du même champion dans le groupe de paliers du joueur. Tant que ce
 * groupe est trop mince, on se rabat sur le poste principal, et l'infobulle le dit.
 */
export const useChampionAdornment = (
  line: StatLineDto,
  references: RadarReferencesDto | null | undefined,
): ((key: MetricKey) => ReactNode | undefined) => {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const champion = useChampionGrid(line.key, references?.tier);
  const poste = useReferenceGrid(
    references?.position,
    "MEAN",
    references?.tier,
  );
  const nom = line.label ?? line.key;

  return (key) => {
    const valeur = line[key];
    if (
      valeur === null ||
      valeur === undefined ||
      line.games < PARTIES_MINIMUM ||
      !references
    ) {
      return undefined;
    }
    const sienne = champion?.metrics[key];
    if (champion && sienne && sienne.polarity !== "NEUTRAL") {
      const p = repartition(champion.percentiles, sienne.values, valeur);
      const note = sienne.polarity === "LOWER" ? 1 - p : p;
      return (
        <PercentileMark
          value={note}
          title={t("grade.champion", {
            rank: Math.round(note * 100),
            champion: nom,
            group: t(`group.${champion.group}`, {
              defaultValue: champion.group ?? "",
            }),
            count: sienne.count,
          })}
        />
      );
    }
    if (!poste) {
      return undefined;
    }
    const grade = noter(valeur, poste.metrics[key], poste, references.tier);
    if (grade?.inTier === null || grade?.inTier === undefined || !grade.tier) {
      return undefined;
    }
    return (
      <PercentileMark
        value={grade.inTier}
        title={t("grade.championFallback", {
          champion: nom,
          group: t(`group.${champion?.group ?? grade.tier}`, {
            defaultValue: grade.tier,
          }),
          tier: t(`tier.${grade.tier}`, { defaultValue: grade.tier }),
          position: format.poste(references.position),
        })}
      />
    );
  };
};
