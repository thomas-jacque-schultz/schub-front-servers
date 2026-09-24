import { useTranslation } from "react-i18next";
import {
  Card,
  Columns,
  Frame,
  ScoreRow,
  Stack,
  Text,
} from "../../../design-system";
import type { RadarReferencesDto, StatLineDto } from "../../types/stats";
import { FAMILLES, useMetrics } from "./metrics";
import { useStatsFormat } from "./statsFormat";
import { useGrades } from "./useGrades";

export interface GameAnalysisProps {
  overall: StatLineDto;
  references: RadarReferencesDto | null | undefined;
  positions: StatLineDto[];
}

/**
 * Famille par famille, chaque chiffre face aux joueurs de son palier : la jauge dit la part qu'il dépasse,
 * l'emblème le palier dont il se rapproche quand la stat suit le rang.
 */
export function GameAnalysis({
  overall,
  references,
  positions,
}: GameAnalysisProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { tuiles } = useMetrics();
  const grades = useGrades(references, positions);

  return (
    <Card
      title={t("family.title")}
      description={
        references?.tier
          ? t("family.helper", {
              tier: t(`tier.${references.tier}`, {
                defaultValue: references.tier,
              }),
              position: format.poste(references.position),
            })
          : t("family.helperNoTier")
      }
    >
      <Columns minWidth={320} count={3}>
        {FAMILLES.map((famille) => {
          const lignes = tuiles(overall, { keys: famille.metrics });
          const scores = famille.metrics
            .map((key) => grades.grade(key)?.inTier)
            .filter((score): score is number => typeof score === "number");
          const moyenne =
            scores.length > 0
              ? scores.reduce((a, b) => a + b, 0) / scores.length
              : null;
          return (
            <Frame key={famille.key}>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justify="between"
                  align="baseline"
                  spacing={1}
                >
                  <Text variant="subtitle">
                    {t(`family.${famille.key}`, { defaultValue: famille.key })}
                  </Text>
                  {moyenne !== null && (
                    <Text variant="caption" tone="secondary">
                      {t("family.average", {
                        top: Math.max(1, Math.round((1 - moyenne) * 100)),
                      })}
                    </Text>
                  )}
                </Stack>
                <Stack spacing={0}>
                  {lignes.map((ligne) => {
                    const note = grades.grade(
                      ligne.key as (typeof famille.metrics)[number],
                    );
                    const rang = note?.inTier ?? null;
                    return (
                      <ScoreRow
                        key={ligne.key}
                        label={ligne.label}
                        value={ligne.value}
                        hint={ligne.hint}
                        score={rang}
                        scoreLabel={
                          rang === null
                            ? undefined
                            : t("family.better", {
                                rank: Math.round(rang * 100),
                              })
                        }
                        adornment={grades.label(
                          ligne.key as (typeof famille.metrics)[number],
                        )}
                      />
                    );
                  })}
                </Stack>
                {famille.key === "laning" && (
                  <Text variant="caption" tone="secondary">
                    {t("family.laningBasis", { count: overall.laningGames })}
                  </Text>
                )}
              </Stack>
            </Frame>
          );
        })}
      </Columns>
    </Card>
  );
}
