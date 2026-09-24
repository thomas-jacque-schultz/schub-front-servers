import { useTranslation } from "react-i18next";
import { Text } from "../../../design-system";
import type { PoolState } from "../../types/pool";

export interface PoolStateNoteProps {
  state: PoolState;
}

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
