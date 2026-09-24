import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getTeamPlayersStatsApi } from "../../api/statsApi";
import { messageOf, useRequest } from "../../../api/useRequest";
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
import { playerColumn } from "./playerColumn";
import { PlayerHeader } from "./PlayerStatsColumn";
import { PlayerStatsView } from "./PlayerStatsView";
import { RadarReferenceSelector } from "./PlayerRadar";
import { type RadarReference, referenceParDefaut } from "./radar";
import { useWindowOptions } from "./windows";

export interface PlayersPanelProps {
  teamId: string;
}

const RADAR_JUSQU_A = 3;

export function PlayersPanel({ teamId }: PlayersPanelProps) {
  const { t } = useTranslation("stats");
  const fenetres = useWindowOptions();
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
  const [referentiel, setReferentiel] = useState<RadarReference | null>(null);

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
  const lignesEquipe = joueurs.flatMap((player) =>
    player.state === "STATISTIQUES_CONNUES" && player.overall
      ? [player.overall]
      : [],
  );
  const reference = referentiel ?? referenceParDefaut(lignesEquipe);
  const radars = visibles.length > 1 && visibles.length <= RADAR_JUSQU_A;

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
            <PlayerHeader
              player={visibles[0]}
              isViewer={visibles[0].memberId === stats?.viewerMemberId}
            />
          </Card>
          <PlayerStatsView
            data={visibles[0]}
            versusTeammates={visibles[0].versusTeammates}
            teamLines={lignesEquipe}
          />
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          {radars && (
            <RadarReferenceSelector
              value={reference}
              onChange={(valeur) => setReferentiel(valeur as RadarReference)}
              teamAvailable={lignesEquipe.length >= 2}
            />
          )}
          <AlignedColumns
            minWidth={220}
            count={Math.max(1, Math.min(6, visibles.length))}
            columns={visibles.map((player) =>
              playerColumn(player, {
                isViewer: player.memberId === stats?.viewerMemberId,
                showRadar: radars,
                teamLines: lignesEquipe,
                reference,
              }),
            )}
          />
        </Stack>
      )}
    </Stack>
  );
}
