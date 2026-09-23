import { useTranslation } from "react-i18next";
import type { AverageRankDto, RankedStandingDto } from "../../../types/stats";
import { useStatsFormat } from "./statsFormat";

const PALIERS = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND"] as const;
const APEX = ["MASTER", "GRANDMASTER", "CHALLENGER"] as const;
const DIVISIONS = ["IV", "III", "II", "I"] as const;

/** Fer IV = 0, une division = 1, Challenger = 30. Les LP départagent à l'intérieur d'une division. */
export const RANG_MAX = PALIERS.length * DIVISIONS.length + APEX.length - 1;

export const rangNumerique = (standing: RankedStandingDto | null | undefined): number | null => {
  if (!standing?.tier) {
    return null;
  }
  const apex = (APEX as readonly string[]).indexOf(standing.tier);
  if (apex >= 0) {
    return PALIERS.length * DIVISIONS.length + apex;
  }
  const palier = (PALIERS as readonly string[]).indexOf(standing.tier);
  const division = (DIVISIONS as readonly string[]).indexOf(standing.division ?? "");
  if (palier < 0 || division < 0) {
    return null;
  }
  return palier * DIVISIONS.length + division + Math.min(standing.leaguePoints, 99) / 100;
};

/** Le classement qui dit le mieux le niveau : solo/duo d'abord, flex à défaut. */
export const rangDeReference = (standings: RankedStandingDto[]): RankedStandingDto | null =>
  standings.find((standing) => standing.queue === "RANKED_SOLO" && standing.tier) ??
  standings.find((standing) => standing.queue === "RANKED_FLEX" && standing.tier) ??
  null;

export const useRankLabel = () => {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  return (
    standing: Pick<RankedStandingDto, "tier" | "division" | "leaguePoints"> | null | undefined,
  ) =>
    standing?.tier
      ? t("ranked.rank", {
          tier: t(`tier.${standing.tier}`, { defaultValue: standing.tier }),
          division: standing.division ?? "",
          lp: format.entier(standing.leaguePoints),
        })
      : format.absent;
};

/** « Or II » pour une moyenne : les LP d'une moyenne n'ont pas de sens. */
export const useAverageRankLabel = () => {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  return (rank: AverageRankDto | null | undefined) =>
    rank
      ? `${t(`tier.${rank.tier}`, { defaultValue: rank.tier })}${rank.division ? ` ${rank.division}` : ""}`
      : format.absent;
};

/** Un écart de rang, en divisions et signé : « +1,5 div. ». */
// Le camp avantagé est nommé : un signe obligerait à retenir dans quel sens se fait la soustraction.
export const useRankGap = () => {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  return (
    gap: number | null | undefined,
  ): { label: string; tone: "success" | "error" | "neutral" } | null => {
    if (gap === null || gap === undefined) {
      return null;
    }
    const valeur = format.ratio(Math.abs(gap));
    if (valeur === format.ratio(0)) {
      return { label: t("rankGap.even"), tone: "neutral" };
    }
    return gap > 0
      ? { label: t("rankGap.ours", { value: valeur }), tone: "success" }
      : { label: t("rankGap.theirs", { value: valeur }), tone: "error" };
  };
};
