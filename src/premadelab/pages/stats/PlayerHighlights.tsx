import { useTranslation } from "react-i18next";
import {
  Button,
  InsightCard,
  Stack,
  StatGrid,
  Text,
  VerdictMark,
  type Verdict,
  verdictOf,
} from "../../../common";
import { familyAnchor } from "./anchors";
import type { PlayerStatsData } from "./PlayerStatsView";
import { FAMILLES, type MetricKey, SOMME_NULLE, useMetrics } from "./metrics";
import { useStatsFormat } from "./statsFormat";
import { useKpiSentence } from "./kpiSentence";
import { useGradeAdornment, useGrades } from "./useGrades";

const RETENUS = 2;

interface Constat {
  key: MetricKey;
  family: string;
  score: number;
}

/** En tête de fiche (Schub#93) : deux forces et deux points à travailler, chacun renvoie à sa famille. */
export function PlayerHighlights({ data }: { data: PlayerStatsData }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { definitions, tuiles } = useMetrics();
  const grades = useGrades(data.references, data.positions);
  const adornment = useGradeAdornment(data.references, data.positions);
  const conclusionDe = useKpiSentence(
    data.references,
    data.positions,
    data.months,
  );
  const overall = data.overall;
  if (!overall) {
    return null;
  }

  const constats: Constat[] = FAMILLES.flatMap((famille) =>
    famille.metrics
      .filter(
        (key) =>
          !SOMME_NULLE.includes(key) && definitions[key].polarity !== "neutral",
      )
      .map((key) => ({
        key,
        family: famille.key,
        score: grades.grade(key)?.inTier,
      }))
      .filter((c): c is Constat => typeof c.score === "number"),
  );
  const forces = [...constats]
    .sort((a, b) => b.score - a.score)
    .filter((c) => c.score > 0.6)
    .slice(0, RETENUS);
  const faiblesses = [...constats]
    .sort((a, b) => a.score - b.score)
    .filter((c) => c.score < 0.4)
    .slice(0, RETENUS);
  const moyenne =
    constats.length > 0
      ? constats.reduce((somme, c) => somme + c.score, 0) / constats.length
      : null;
  const verdict: Verdict | undefined =
    moyenne === null ? undefined : verdictOf(moyenne);
  const contexte = data.references?.tier
    ? {
        tier: t(`tier.${data.references.tier}`, {
          defaultValue: data.references.tier,
        }),
        position: format.poste(data.references.position),
      }
    : null;

  const ligne = (constat: Constat) => {
    const cran = verdictOf(constat.score);
    return (
      <Button
        key={constat.key}
        variant="ghost"
        size="small"
        onClick={() =>
          document
            .getElementById(familyAnchor(constat.family))
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      >
        <Stack direction="row" spacing={1} align="center">
          <VerdictMark verdict={cran} />
          <Text>
            {t(`highlights.line.${cran}`, {
              metric: definitions[constat.key].label,
              ...contexte,
            })}
          </Text>
        </Stack>
      </Button>
    );
  };

  const tableau = (
    <Stack spacing={1}>
      <StatGrid
        items={tuiles(overall, { adornment }).map((tuile) => ({
          ...tuile,
          hint: conclusionDe(tuile.key as MetricKey) ?? tuile.hint,
        }))}
        minWidth={130}
        divided
        align="center"
        labelLines={2}
      />
      <Text variant="caption" tone="secondary" align="center">
        {[format.assise(data.coverage), t("scope.rift")]
          .filter(Boolean)
          .join(" · ")}
      </Text>
    </Stack>
  );

  if (verdict === undefined || !contexte) {
    return (
      <InsightCard
        title={t("highlights.title")}
        conclusion={t("highlights.noTier")}
        visual={tableau}
      />
    );
  }

  return (
    <InsightCard
      title={t("highlights.title")}
      conclusion={t(`highlights.overall.${verdict}`, contexte)}
      verdict={verdict}
      details={tableau}
      detailsLabel={t("highlights.allNumbers")}
      hideDetailsLabel={t("verdict.hideDetails")}
      visual={
        <Stack direction="responsive" spacing={2}>
          <Stack spacing={0.5} fullWidth>
            <Text variant="overline">{t("highlights.strengths")}</Text>
            {forces.length > 0 ? (
              forces.map(ligne)
            ) : (
              <Text variant="caption" tone="secondary">
                {t("highlights.noStrength")}
              </Text>
            )}
          </Stack>
          <Stack spacing={0.5} fullWidth>
            <Text variant="overline">{t("highlights.weaknesses")}</Text>
            {faiblesses.length > 0 ? (
              faiblesses.map(ligne)
            ) : (
              <Text variant="caption" tone="secondary">
                {t("highlights.noWeakness")}
              </Text>
            )}
          </Stack>
        </Stack>
      }
    />
  );
}
