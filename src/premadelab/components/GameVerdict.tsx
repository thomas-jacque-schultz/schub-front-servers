import { useTranslation } from "react-i18next";
import { InsightCard, type Verdict } from "../../common";
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

/** La revue d'une partie commence par une phrase (Schub#94) ; tous les constats et leurs preuves dans le détail. */
export function GameVerdict({ findings }: { findings: FindingDto[] }) {
  const { t } = useTranslation(["lol", "stats"]);
  const phrase = useFindingSentence();
  const tete = principal(findings);
  if (!tete) {
    return null;
  }
  return (
    <InsightCard
      title={t("findings.verdict")}
      conclusion={phrase(tete)}
      verdict={VERDICT[tete.polarity]}
      details={<FindingList findings={findings} />}
      detailsLabel={t("findings.all", { count: findings.length })}
      hideDetailsLabel={t("verdict.hideDetails", { ns: "stats" })}
    />
  );
}
