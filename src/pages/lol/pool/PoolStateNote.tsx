import { useTranslation } from "react-i18next";
import { Text } from "../../../design-system";
import type { PoolState } from "../../../types/pool";

export interface PoolStateNoteProps {
  state: PoolState;
}

/**
 * Pourquoi on ne sait rien des maîtrises de ce membre.
 *
 * <p>Les quatre raisons n'appellent pas le même geste : lier un compte, revenir plus tard, ou rien
 * du tout parce que ce compte n'a réellement aucune maîtrise. Un message unique les confondrait
 * toutes en panne.</p>
 */
export function PoolStateNote({ state }: PoolStateNoteProps) {
  const { t } = useTranslation("pool");

  if (state === "MAITRISES_CONNUES") {
    return null;
  }

  return (
    <Text variant="caption" tone="secondary">
      {t(`state.${state}.short`)}
    </Text>
  );
}
