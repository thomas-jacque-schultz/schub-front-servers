import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamPlayersStatsApi } from "../../../api/statsApi";
import {
  AlignedColumns,
  Alert,
  AvatarToggleGroup,
  Card,
  ProgressBar,
  SelectField,
  Stack,
  Text,
} from "../../../design-system";
import type { TeamPlayersStatsDto } from "../../../types/stats";
import { playerColumn } from "./playerColumn";
import { PlayerHeader } from "./PlayerStatsColumn";
import { PlayerStatsView } from "./PlayerStatsView";
import { useWindowOptions } from "./windows";

export interface PlayersPanelProps {
  teamId: string;
}

const RADAR_JUSQU_A = 3;

export function PlayersPanel({ teamId }: PlayersPanelProps) {
  const { t } = useTranslation("stats");
  const fenetres = useWindowOptions();
  const [days, setDays] = useState<string>("");
  const [stats, setStats] = useState<TeamPlayersStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [choisis, setChoisis] = useState<string[]>([]);

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

  const joueurs = stats?.players ?? [];
  const visibles =
    choisis.length === 0 ? joueurs : joueurs.filter((player) => choisis.includes(player.memberId));

  return (
    <Stack spacing={2}>
      {joueurs.length > 1 && (
        <Stack direction="row" spacing={2} align="center" wrap>
          <AvatarToggleGroup
            label={t("players.filter")}
            options={joueurs.map((player) => ({
              value: player.memberId,
              name: player.displayName ?? t("player.unnamed"),
              src: player.avatarUrl,
            }))}
            values={choisis}
            onChange={setChoisis}
          />
          <Text variant="caption" tone="secondary">
            {visibles.length > RADAR_JUSQU_A
              ? t("players.radarHint", { count: RADAR_JUSQU_A })
              : t("players.filterHint")}
          </Text>
        </Stack>
      )}

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
      ) : visibles.length === 1 ? (
        // Un seul joueur retenu : la même vue que Mes stats.
        <Stack spacing={2}>
          <Card>
            <PlayerHeader player={visibles[0]} isViewer={visibles[0].memberId === stats?.viewerMemberId} />
          </Card>
          <PlayerStatsView
            data={visibles[0]}
            scale={stats?.scale ?? null}
            versusTeammates={visibles[0].versusTeammates}
          />
        </Stack>
      ) : (
        <AlignedColumns
          minWidth={220}
          count={Math.max(1, Math.min(6, visibles.length))}
          columns={visibles.map((player) =>
            playerColumn(player, {
              isViewer: player.memberId === stats?.viewerMemberId,
              scale: stats?.scale ?? null,
              showRadar: visibles.length <= RADAR_JUSQU_A,
            }),
          )}
        />
      )}
    </Stack>
  );
}
