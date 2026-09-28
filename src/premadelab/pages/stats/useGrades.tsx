import type { ReactNode } from "react";
import type { RadarReferencesDto, StatLineDto } from "../../types/stats";
import { type Grade, noter } from "./grading";
import {
  GradeLabel,
  LevelCrest,
  type LevelCrestProps,
  MissingDataMark,
} from "./LevelCrest";
import { type MetricKey, SOMME_NULLE, useMetrics } from "./metrics";
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
    // Un écart à l'adversaire direct ne se note pas contre les autres : leur moyenne vaut zéro (Schub#12).
    if (SOMME_NULLE.includes(key)) {
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

  // Assez de parties pour noter, mais pas de référentiel pour ce palier et ce poste : c'est une donnée manquante.
  const manquante = (key: MetricKey): boolean => {
    if (!references || !ligne || ligne.games < PARTIES_MINIMUM) {
      return false;
    }
    if (
      SOMME_NULLE.includes(key) ||
      ligne[key] === null ||
      ligne[key] === undefined
    ) {
      return false;
    }
    if (
      METRIQUES_A_TIMELINE.includes(key) &&
      ligne.laningGames < PARTIES_MINIMUM
    ) {
      return false;
    }
    if (grille === null) {
      return true;
    }
    const metrique = grille?.metrics[key];
    return !!metrique && metrique.polarity !== "NEUTRAL" && grade(key) === null;
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
      if (props) {
        return <LevelCrest {...props} />;
      }
      return manquante(key) ? <MissingDataMark /> : undefined;
    },
    /** L'icône et le nom du palier, lisibles sans survol. */
    label: (key: MetricKey): ReactNode | undefined => {
      const props = proprietes(key);
      if (props) {
        return <GradeLabel {...props} />;
      }
      return manquante(key) ? <MissingDataMark /> : undefined;
    },
  };
};

export const useGradeAdornment = (
  references: RadarReferencesDto | null | undefined,
  positions: StatLineDto[],
): ((key: MetricKey) => ReactNode | undefined) =>
  useGrades(references, positions).crest;
