import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectField, Stack, Text, useRequest } from "../../../common";
import { getTeamFindingsApi } from "../../api/findingsApi";
import { GameVerdict } from "../../components/GameVerdict";
import { OppositionPanel } from "./OppositionPanel";
import { SynergyPanel } from "./SynergyPanel";
import { TeamEarlyGame } from "./TeamEarlyGame";
import { TeamSummary } from "./TeamSummary";
import { useTeamOpposition } from "./useTeamOpposition";
import { useWindowOptions } from "./windows";

export interface StrategyPanelProps {
  teamId: string;
}

// Une seule fenêtre pour tout l'onglet : un bilan et un niveau adverse sur deux périodes ne se lisent pas ensemble.
export function StrategyPanel({ teamId }: StrategyPanelProps) {
  const { t } = useTranslation("stats");
  const fenetres = useWindowOptions();
  const [periode, setPeriode] = useState<string>("");
  const opposition = useTeamOpposition(teamId, periode);
  const { data: constats } = useRequest(
    `team-findings/${teamId}/${periode}`,
    () => getTeamFindingsApi(teamId, periode),
  );

  return (
    <Stack spacing={3}>
      <SelectField
        label={t("window.label")}
        value={periode}
        onChange={setPeriode}
        options={fenetres}
        helperText={t("window.helper")}
      />
      {constats && constats.length > 0 && (
        <GameVerdict
          findings={constats}
          title={t("synergy.findings")}
          visible={2}
        />
      )}
      <Stack spacing={2}>
        <Text variant="section">{t("strategy.summary")}</Text>
        <TeamSummary teamId={teamId} periode={periode} />
      </Stack>
      <Stack spacing={2}>
        <Text variant="section">{t("strategy.opposition")}</Text>
        <OppositionPanel {...opposition} />
      </Stack>
      <Stack spacing={2}>
        <Text variant="section">{t("synergy.title")}</Text>
        <SynergyPanel teamId={teamId} periode={periode} />
      </Stack>
      {opposition.dto?.state === "STATISTIQUES_CONNUES" && (
        <Stack spacing={2}>
          <Text variant="section">{t("strategy.early")}</Text>
          <TeamEarlyGame
            early={opposition.dto.early}
            level={opposition.dto.level}
          />
        </Stack>
      )}
    </Stack>
  );
}
