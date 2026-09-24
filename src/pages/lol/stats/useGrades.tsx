import type { ReactNode } from "react";
import type { RadarReferencesDto, StatLineDto } from "../../../types/stats";
import { noter } from "./grading";
import { LevelCrest } from "./LevelCrest";
import { type MetricKey, useMetrics } from "./metrics";
import { useReferenceGrid } from "./useReferenceGrid";

const PARTIES_MINIMUM = 5;
const METRIQUES_A_TIMELINE: MetricKey[] = [
  "goldDiffAt15",
  "csDiffAt15",
  "xpDiffAt15",
  "killsDiffAt15",
];

/**
 * Note chaque indicateur sur les parties du joueur à son poste principal : un CS/min de support et un
 * de tireur ne se comparent pas. Sans assez de parties à ce poste, pas d'icône plutôt qu'une fausse.
 */
export const useGradeAdornment = (
  references: RadarReferencesDto | null | undefined,
  positions: StatLineDto[],
): ((key: MetricKey) => ReactNode | undefined) => {
  const grille = useReferenceGrid(
    references?.position,
    "MEAN",
    references?.tier,
  );
  const { definitions } = useMetrics();
  const ligne = positions.find((line) => line.key === references?.position);
  return (key) => {
    if (!grille || !ligne || !references || ligne.games < PARTIES_MINIMUM) {
      return undefined;
    }
    if (
      METRIQUES_A_TIMELINE.includes(key) &&
      ligne.laningGames < PARTIES_MINIMUM
    ) {
      return undefined;
    }
    const grade = noter(
      ligne[key],
      grille.metrics[key],
      grille,
      references.tier,
    );
    return grade ? (
      <LevelCrest
        grade={grade}
        position={references.position}
        patches={grille.patches}
        scope="MEAN"
        format={definitions[key].format}
      />
    ) : undefined;
  };
};
