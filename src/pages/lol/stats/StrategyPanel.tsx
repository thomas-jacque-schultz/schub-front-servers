import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectField, Stack, Text } from "../../../design-system";
import { OppositionPanel } from "./OppositionPanel";
import { TeamSummary } from "./TeamSummary";
import { useWindowOptions } from "./windows";

export interface StrategyPanelProps {
  teamId: string;
}

// Une seule fenêtre pour tout l'onglet : un bilan et un niveau adverse sur deux périodes ne se lisent pas ensemble.
export function StrategyPanel({ teamId }: StrategyPanelProps) {
  const { t } = useTranslation("stats");
  const fenetres = useWindowOptions();
  const [days, setDays] = useState<string>("");

  return (
    <Stack spacing={3}>
      <SelectField
        label={t("window.label")}
        value={days}
        onChange={setDays}
        options={fenetres}
        helperText={t("window.helper")}
      />
      <Stack spacing={2}>
        <Text variant="section">{t("strategy.summary")}</Text>
        <TeamSummary teamId={teamId} days={days} />
      </Stack>
      <Stack spacing={2}>
        <Text variant="section">{t("strategy.opposition")}</Text>
        <OppositionPanel teamId={teamId} days={days} />
      </Stack>
    </Stack>
  );
}
