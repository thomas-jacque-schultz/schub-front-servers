import { useTranslation } from "react-i18next";
import {
  InsightCard,
  Stack,
  Text,
  VerdictMark,
  type Verdict,
} from "../../common";
import type { FindingDto } from "../types/findings";
import { useFindingSentence } from "./findingSentence";
import { FindingList } from "./Findings";

// Le constat le plus sûr résume la partie : une conséquence (ce qui a décidé) passe avant une action.
const principal = (findings: FindingDto[]) =>
  [...findings].sort(
    (a, b) =>
      Number(b.nature === "CONSEQUENCE") - Number(a.nature === "CONSEQUENCE") ||
      Number(a.experimental) - Number(b.experimental) ||
      b.confidence - a.confidence,
  )[0];

const VERDICT: Record<FindingDto["polarity"], Verdict | null> = {
  STRENGTH: "above",
  WEAKNESS: "below",
  NEUTRAL: null,
};

/**
 * Une phrase d'abord (Schub#88) : le constat le plus sûr en conclusion, quelques autres en clair, tous avec leurs
 * preuves dans le détail. Sert la revue d'une partie (#94) et le haut de l'onglet Stratégie (#95).
 */
export function GameVerdict({
  findings,
  title,
  visible = 0,
}: {
  findings: FindingDto[];
  title?: string;
  /** Constats écrits en clair sous la conclusion. */
  visible?: number;
}) {
  const { t } = useTranslation(["lol", "stats"]);
  const phrase = useFindingSentence();
  const tete = principal(findings);
  if (!tete) {
    return null;
  }
  const suivants = findings
    .filter((finding) => finding !== tete && !finding.experimental)
    .slice(0, visible);
  return (
    <InsightCard
      title={title ?? t("findings.verdict")}
      conclusion={phrase(tete)}
      verdict={VERDICT[tete.polarity]}
      visual={
        suivants.length > 0 ? (
          <Stack spacing={0.75}>
            {suivants.map((finding) => (
              <Stack
                key={finding.pattern}
                direction="row"
                spacing={1}
                align="center"
              >
                <VerdictMark verdict={VERDICT[finding.polarity]} />
                <Text>{phrase(finding)}</Text>
              </Stack>
            ))}
          </Stack>
        ) : undefined
      }
      details={<FindingList findings={findings} />}
      detailsLabel={t("findings.all", { count: findings.length })}
      hideDetailsLabel={t("verdict.hideDetails", { ns: "stats" })}
    />
  );
}
