import { useTranslation } from "react-i18next";
import { Alert, Text } from "../../../design-system";
import type { PoolState } from "../../../types/pool";

export interface PoolStateNoteProps {
  state: PoolState;
  /** Discret dans une colonne étroite, en alerte quand c'est tout le panneau qui est vide. */
  variant?: "inline" | "block";
}

const SEVERITE: Record<PoolState, "info" | "warning"> = {
  MAITRISES_CONNUES: "info",
  COMPTE_RIOT_ABSENT: "info",
  MAITRISES_INDISPONIBLES: "warning",
  CATALOGUE_INDISPONIBLE: "warning",
  AUCUNE_MAITRISE: "info",
};

/**
 * Pourquoi la colonne est vide.
 *
 * <p>Les quatre raisons n'appellent pas le même geste : lier un compte, revenir plus tard, ou
 * rien du tout parce que ce compte n'a réellement aucune maîtrise. Un message unique les
 * confondrait toutes en panne.</p>
 */
export function PoolStateNote({ state, variant = "inline" }: PoolStateNoteProps) {
  const { t } = useTranslation("pool");

  if (state === "MAITRISES_CONNUES") {
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
