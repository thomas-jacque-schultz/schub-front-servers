import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamPlayersStatsApi } from "../../../api/statsApi";
import {
  Alert,
  Card,
  Columns,
  ProgressBar,
  SelectField,
  Stack,
  Text,
} from "../../../design-system";
import type { TeamPlayersStatsDto } from "../../../types/stats";
import { PlayerStatsColumn } from "./PlayerStatsColumn";
import { useWindowOptions } from "./windows";

export interface PlayersPanelProps {
  teamId: string;
}

/**
 * <strong>Panneau « joueurs »</strong> — une colonne par joueur.
 *
 * <p>Chargé à l'ouverture de l'onglet et pas avant : le panneau interroge cinq historiques, et
 * une équipe qu'on ouvre pour renommer n'a pas à les payer.</p>
 */
export function PlayersPanel({ teamId }: PlayersPanelProps) {
  const { t } = useTranslation("stats");
  const fenetres = useWindowOptions();
  const [days, setDays] = useState<string>("");
  const [stats, setStats] = useState<TeamPlayersStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setStats(
        await getTeamPlayersStatsApi(teamId, days ? Number(days) : null),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("loadFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [teamId, days, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading && !stats) {
    return <ProgressBar label={t("loading")} />;
  }

  if (error && !stats) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} align="center" wrap>
        <SelectField
          label={t("window.label")}
          value={days}
          onChange={setDays}
          options={fenetres}
          helperText={t("window.helper")}
        />
        <Text variant="caption" tone="secondary">
          {t("window.bounded")}
        </Text>
      </Stack>

      {error && <Alert severity="warning">{error}</Alert>}

      {stats && stats.players.length === 0 ? (
        <Card>
          <Text variant="body" tone="secondary">
            {t("emptyRoster")}
          </Text>
        </Card>
      ) : (
        <Columns minWidth={260}>
          {stats?.players.map((player) => (
            <PlayerStatsColumn
              key={player.memberId}
              player={player}
              isViewer={player.memberId === stats.viewerMemberId}
            />
          ))}
        </Columns>
      )}
    </Stack>
  );
}
