import { useTranslation } from "react-i18next";
import { Alert, Text } from "../../../design-system";
import type { StatsState } from "../../../types/stats";

export interface StatsStateNoteProps {
  state: StatsState;
  /** Discret dans une colonne étroite, en alerte quand c'est tout le panneau qui est vide. */
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

/**
 * Pourquoi c'est vide.
 *
 * <p>Les cinq raisons n'appellent pas le même geste : lier un compte, attendre, compléter
 * l'effectif, revenir plus tard, ou rien du tout parce qu'il n'y a réellement aucune partie. Un
 * message unique les confondrait toutes en panne.</p>
 */
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
