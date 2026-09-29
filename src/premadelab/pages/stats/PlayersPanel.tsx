import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamPlayersStatsApi } from "../../api/statsApi";
import {
  Alert,
  AlignedColumns,
  AvatarToggleGroup,
  Card,
  ProgressBar,
  SelectField,
  Stack,
  Text,
  messageOf,
  useHistoryWindow,
  useRequest,
} from "../../../common";
import { playerColumn } from "./playerColumn";
import { championsEnColonne } from "./champions";
import { lignesPremade } from "./premade";
import { useWindowOptions } from "./windows";

export interface PlayersPanelProps {
  teamId: string;
}

const RADAR_JUSQU_A = 3;

export function PlayersPanel({ teamId }: PlayersPanelProps) {
  const { t } = useTranslation("stats");
  const fenetres = useWindowOptions();
  const historyWindow = useHistoryWindow();
  const [periode, setPeriode] = useState<string>("");
  const {
    data: stats,
    error: echec,
    isLoading,
  } = useRequest(`${teamId}/${periode}`, () =>
    getTeamPlayersStatsApi(teamId, periode),
  );
  const error = echec === null ? "" : messageOf(echec, t("loadFailed"));
  const [choisis, setChoisis] = useState<string[]>([]);
  const [choixChampions, setChoixChampions] = useState<
    Record<string, string[]>
  >({});

  if (isLoading && !stats) {
    return <ProgressBar label={t("loading")} />;
  }

  if (error && !stats) {
    return <Alert severity="error">{error}</Alert>;
  }

  const joueurs = stats?.players ?? [];
  const visibles =
    choisis.length === 0
      ? joueurs
      : joueurs.filter((player) => choisis.includes(player.memberId));
  const championRows = Math.max(
    0,
    ...visibles
      .filter((player) => player.state === "STATISTIQUES_CONNUES")
      .map(
        (player) =>
          championsEnColonne(player, choixChampions[player.memberId] ?? [])
            .length,
      ),
  );
  const premadeLines = lignesPremade(joueurs);
  const radars = visibles.length <= RADAR_JUSQU_A;

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
          value={periode}
          onChange={setPeriode}
          options={fenetres}
          helperText={t("window.helper")}
        />
        <Text variant="caption" tone="secondary">
          {historyWindow
            ? t("window.bounded", { ...historyWindow })
            : t("window.boundedUnknown")}
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
        <Stack spacing={1.5}>
          <Text variant="caption" tone="secondary">
            {stats?.premadeGames === null || stats?.premadeGames === undefined
              ? t("premade.unknown")
              : t("premade.summary", {
                  count: stats.premadeGames,
                  minimum: stats.premadeMinimum,
                })}
          </Text>
          <AlignedColumns
            minWidth={220}
            count={Math.max(1, Math.min(6, visibles.length))}
            columns={visibles.map((player) =>
              playerColumn(player, {
                isViewer: player.memberId === stats?.viewerMemberId,
                showRadar: radars,
                premadeLines,
                champions: choixChampions[player.memberId] ?? [],
                onChampionsChange: (keys) =>
                  setChoixChampions((avant) => ({
                    ...avant,
                    [player.memberId]: keys,
                  })),
                championRows,
              }),
            )}
          />
        </Stack>
      )}
    </Stack>
  );
}
