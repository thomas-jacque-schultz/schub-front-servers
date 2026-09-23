import { Chip } from "../../../design-system";
import type { RankedStandingDto } from "../../../types/stats";
import { useRankLabel } from "./rank";

export function RankBadge({ standing }: { standing: RankedStandingDto | null | undefined }) {
  const libelle = useRankLabel();
  return <Chip label={libelle(standing)} variant="outline" size="small" />;
}
