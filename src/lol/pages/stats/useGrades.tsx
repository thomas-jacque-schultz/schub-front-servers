import type { ReactNode } from "react";
import type { RadarReferencesDto, StatLineDto } from "../../types/stats";
import { type Grade, noter } from "./grading";
import { GradeLabel, LevelCrest, type LevelCrestProps } from "./LevelCrest";
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
 * de tireur ne se comparent pas. Sans assez de parties à ce poste, pas de note plutôt qu'une fausse.
 */
export const useGrades = (
  references: RadarReferencesDto | null | undefined,
  positions: StatLineDto[],
) => {
  const grille = useReferenceGrid(
    references?.position,
    "MEAN",
    references?.tier,
  );
  const { definitions } = useMetrics();
  const ligne = positions.find((line) => line.key === references?.position);

  const grade = (key: MetricKey): Grade | null => {
    if (!grille || !ligne || !references || ligne.games < PARTIES_MINIMUM) {
      return null;
    }
    if (
      METRIQUES_A_TIMELINE.includes(key) &&
      ligne.laningGames < PARTIES_MINIMUM
    ) {
      return null;
    }
    return noter(ligne[key], grille.metrics[key], grille, references.tier);
  };

  const proprietes = (key: MetricKey): LevelCrestProps | null => {
    const note = grade(key);
    return note && grille && references
      ? {
          grade: note,
          position: references.position,
          patches: grille.patches,
          scope: "MEAN",
          format: definitions[key].format,
        }
      : null;
  };

  return {
    grade,
    /** L'icône seule, à côté d'un chiffre. */
    crest: (key: MetricKey): ReactNode | undefined => {
      const props = proprietes(key);
      return props ? <LevelCrest {...props} /> : undefined;
    },
    /** L'icône et le nom du palier, lisibles sans survol. */
    label: (key: MetricKey): ReactNode | undefined => {
      const props = proprietes(key);
      return props ? <GradeLabel {...props} /> : undefined;
    },
  };
};

export const useGradeAdornment = (
  references: RadarReferencesDto | null | undefined,
  positions: StatLineDto[],
): ((key: MetricKey) => ReactNode | undefined) =>
  useGrades(references, positions).crest;
