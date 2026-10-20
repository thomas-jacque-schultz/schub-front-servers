import { useTranslation } from "react-i18next";
import {
  Columns,
  DivergingBar,
  InsightCard,
  MeterBar,
  ScoreRow,
  Stack,
  Text,
  type Verdict,
  verdictOf,
} from "../../../common";
import type { RadarReferencesDto, StatLineDto } from "../../types/stats";
import { FAMILLES, type MetricKey, useMetrics } from "./metrics";
import { familyAnchor } from "./anchors";
import { useStatsFormat } from "./statsFormat";
import { useKpiSentence } from "./kpiSentence";
import { useGrades } from "./useGrades";
import { DistributionDetail } from "./DistributionDetail";
import type { RepartieKey } from "./distribution";

export interface GameAnalysisProps {
  overall: StatLineDto;
  references: RadarReferencesDto | null | undefined;
  positions: StatLineDto[];
  /** Pour lire les écarts à somme nulle contre soi-même, d'un mois sur l'autre. */
  months?: StatLineDto[];
}

// Un écart à 15 min remplit sa demi-barre à cette valeur : au-delà, l'avance est décisive.
// Schub#129 : les familles où se lisent les morts, le KDA et les kills.
const REPARTITIONS: Record<string, RepartieKey[]> = {
  survival: ["deaths", "kda"],
  fights: ["kills"],
};

const ECARTS_15: { key: MetricKey; max: number }[] = [
  { key: "goldDiffAt15", max: 2000 },
  { key: "csDiffAt15", max: 20 },
  { key: "xpDiffAt15", max: 1000 },
];

/**
 * Une famille par encart (Schub#93) : une phrase et une jauge face au palier ; les chiffres dans le détail.
 * La phase de couloir se lit en écarts à l'adversaire direct, centrés sur zéro : la moyenne de tout palier.
 */
export function GameAnalysis({
  overall,
  references,
  positions,
  months = [],
}: GameAnalysisProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { tuiles, definitions } = useMetrics();
  const grades = useGrades(references, positions);
  const conclusion = useKpiSentence(references, positions, months);
  const contexte = references?.tier
    ? {
        tier: t(`tier.${references.tier}`, { defaultValue: references.tier }),
        position: format.poste(references.position),
      }
    : null;

  const lignes = (keys: MetricKey[]) => (
    <Stack spacing={0}>
      {tuiles(overall, { keys }).map((ligne) => {
        const key = ligne.key as MetricKey;
        const rang = grades.grade(key)?.inTier ?? null;
        return (
          <ScoreRow
            key={key}
            label={ligne.label}
            value={ligne.value}
            hint={conclusion(key) ?? ligne.hint}
            score={rang}
            scoreLabel={
              rang === null
                ? undefined
                : t("family.better", { rank: Math.round(rang * 100) })
            }
            adornment={grades.label(key)}
          />
        );
      })}
    </Stack>
  );

  const couloir = (keys: MetricKey[]) => {
    const or = overall.goldDiffAt15;
    const avance =
      or === null || or === undefined || overall.laningGames === 0 ? null : or;
    return (
      <InsightCard
        key="laning"
        title={t("family.laning")}
        conclusion={
          avance === null
            ? t("family.laningNone")
            : t(
                avance >= 150
                  ? "family.laningAhead"
                  : avance <= -150
                    ? "family.laningBehind"
                    : "family.laningEven",
                { gold: format.entier(Math.abs(avance)) },
              )
        }
        verdict={
          avance === null
            ? undefined
            : avance >= 150
              ? "above"
              : avance <= -150
                ? "below"
                : "average"
        }
        visual={
          avance === null ? undefined : (
            <Stack spacing={0.25}>
              {ECARTS_15.map(({ key, max }) => {
                const valeur = overall[key];
                return typeof valeur === "number" ? (
                  <DivergingBar
                    key={key}
                    label={definitions[key].label}
                    value={valeur}
                    max={max}
                    valueLabel={definitions[key].format(valeur)}
                    centerLabel={t("family.laningCenter")}
                  />
                ) : null;
              })}
            </Stack>
          )
        }
        details={
          <Stack spacing={1}>
            {lignes(keys)}
            <Text variant="caption" tone="secondary">
              {t("family.laningBasis", { count: overall.laningGames })}
            </Text>
          </Stack>
        }
        detailsLabel={t("verdict.details")}
        hideDetailsLabel={t("verdict.hideDetails")}
      />
    );
  };

  return (
    <Stack spacing={2}>
      <Text variant="section">{t("family.title")}</Text>
      <Columns minWidth={300} count={3}>
        {FAMILLES.map((famille) => {
          if (famille.key === "laning") {
            return (
              <div key={famille.key} id={familyAnchor(famille.key)}>
                {couloir(famille.metrics)}
              </div>
            );
          }
          const scores = famille.metrics
            .filter((key) => definitions[key].polarity !== "neutral")
            .map((key) => grades.grade(key)?.inTier)
            .filter((score): score is number => typeof score === "number");
          const moyenne =
            scores.length > 0
              ? scores.reduce((a, b) => a + b, 0) / scores.length
              : null;
          const verdict: Verdict | undefined =
            moyenne === null ? undefined : verdictOf(moyenne);
          const titre = t(`family.${famille.key}`, {
            defaultValue: famille.key,
          });
          return (
            <div key={famille.key} id={familyAnchor(famille.key)}>
              <InsightCard
                title={titre}
                conclusion={
                  verdict && contexte
                    ? t(`family.sentence.${verdict}`, contexte)
                    : undefined
                }
                verdict={verdict}
                visual={
                  moyenne === null ? (
                    lignes(famille.metrics)
                  ) : (
                    <MeterBar
                      value={moyenne}
                      label={t(`verdict.${verdictOf(moyenne)}`)}
                      valueLabel={t("family.better", {
                        rank: Math.round(moyenne * 100),
                      })}
                    />
                  )
                }
                details={
                  REPARTITIONS[famille.key] && references?.position ? (
                    <Stack spacing={2}>
                      {moyenne !== null && lignes(famille.metrics)}
                      <DistributionDetail
                        keys={REPARTITIONS[famille.key]}
                        references={references}
                        positions={positions}
                      />
                    </Stack>
                  ) : moyenne === null ? undefined : (
                    lignes(famille.metrics)
                  )
                }
                detailsLabel={t("verdict.details")}
                hideDetailsLabel={t("verdict.hideDetails")}
              />
            </div>
          );
        })}
      </Columns>
      <Text variant="caption" tone="secondary">
        {contexte ? t("family.helper", contexte) : t("family.helperNoTier")}
      </Text>
    </Stack>
  );
}
