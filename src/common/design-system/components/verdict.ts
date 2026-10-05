export const VERDICTS = [
  "veryBelow",
  "below",
  "average",
  "above",
  "veryAbove",
] as const;

export type Verdict = (typeof VERDICTS)[number];

/** Une seule échelle pour « suis-je au niveau ? » : la part de son palier qui fait moins bien, en cinq crans. */
export const verdictOf = (score: number): Verdict =>
  score < 0.2
    ? "veryBelow"
    : score < 0.4
      ? "below"
      : score <= 0.6
        ? "average"
        : score <= 0.8
          ? "above"
          : "veryAbove";

export const verdictTone = (verdict: Verdict): "good" | "neutral" | "bad" =>
  verdict === "above" || verdict === "veryAbove"
    ? "good"
    : verdict === "average"
      ? "neutral"
      : "bad";
