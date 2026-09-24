import { useTranslation } from "react-i18next";
import { Alert, Text } from "../../../design-system";
import type { StatsState } from "../../types/stats";

export interface StatsStateNoteProps {
  state: StatsState;
  variant?: "inline" | "block";
}

const SEVERITE: Record<StatsState, "info" | "warning"> = {
  STATISTIQUES_CONNUES: "info",
  COMPTE_RIOT_ABSENT: "info",
  INGESTION_EN_COURS: "info",
  AUCUNE_PARTIE: "info",
  EFFECTIF_INCOMPLET: "info",
  CONNECTEUR_INDISPONIBLE: "warning",
};

export function StatsStateNote({
  state,
  variant = "inline",
}: StatsStateNoteProps) {
  const { t } = useTranslation("stats");

  if (state === "STATISTIQUES_CONNUES") {
    return null;
  }

  if (variant === "inline") {
    return (
      <Text variant="caption" tone="secondary">
        {t(`state.${state}.short`)}
      </Text>
    );
  }

  return (
    <Alert severity={SEVERITE[state]} title={t(`state.${state}.title`)}>
      {t(`state.${state}.description`)}
    </Alert>
  );
}
