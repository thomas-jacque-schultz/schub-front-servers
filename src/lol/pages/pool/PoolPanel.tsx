import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getChampionPoolApi,
  setPoolChampionsApi,
  setPoolMasteryFloorApi,
} from "../../api/poolApi";
import {
  Alert,
  Button,
  Card,
  Columns,
  EmptyState,
  ProgressBar,
  Stack,
  Text,
  TextField,
} from "../../../design-system";
import { useLocaleFormat } from "../../../i18n/format";
import type { ChampionPoolColumnDto, ChampionPoolDto } from "../../types/pool";
import type { GameRole } from "../../types/team";
import { ChampionPicker } from "./ChampionPicker";
import { PoolChampionCard } from "./PoolChampionCard";
import { PoolStateNote } from "./PoolStateNote";

export interface PoolPanelProps {
  teamId: string;
}

export function PoolPanel({ teamId }: PoolPanelProps) {
  const { t } = useTranslation("pool");
  const { t: tTeams } = useTranslation("teams");
  const { formatDateTime } = useLocaleFormat();

  const [pool, setPool] = useState<ChampionPoolDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [apercu, setApercu] = useState<number | null>(null);
  const [saisie, setSaisie] = useState<string>("");
  const [posteChoisi, setPosteChoisi] = useState<GameRole | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const reponse = await getChampionPoolApi(teamId, apercu);
      setPool(reponse);
      setSaisie(String(reponse.masteryFloor));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [teamId, apercu, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const ecrit = async (action: () => Promise<ChampionPoolDto>) => {
    setIsSaving(true);
    setError("");
    try {
      const reponse = await action();
      setPool(reponse);
      setSaisie(String(reponse.masteryFloor));
      setApercu(null);
      setPosteChoisi(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !pool) {
    return <ProgressBar label={t("loading")} />;
  }

  if (error && !pool) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!pool) {
    return null;
  }

  const plancherSaisi = Number(saisie);
  const plancherValide = Number.isFinite(plancherSaisi) && plancherSaisi >= 0;
  const colonneChoisie = pool.columns.find((colonne) => colonne.role === posteChoisi);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} align="end" wrap>
        <TextField
          label={t("floor.label")}
          value={saisie}
          onChange={setSaisie}
          helperText={t("floor.helper")}
          type="number"
        />
        <Button
          variant="secondary"
          disabled={!plancherValide}
          onClick={() => setApercu(plancherSaisi)}
        >
          {t("floor.apply")}
        </Button>
        {pool.viewerCanEdit && (
          <Button
            disabled={!plancherValide}
            loading={isSaving}
            onClick={() => void ecrit(() => setPoolMasteryFloorApi(teamId, plancherSaisi))}
          >
            {t("floor.save")}
          </Button>
        )}
        {pool.patch && <Text variant="caption" tone="secondary">{t("patch.label", { version: pool.patch })}</Text>}
      </Stack>

      <Text variant="caption" tone="secondary">
        {pool.masteryFloor === pool.teamMasteryFloor
          ? t("floor.saved", { count: pool.teamMasteryFloor })
          : t("floor.preview", { count: pool.masteryFloor, team: pool.teamMasteryFloor })}
      </Text>

      {error && <Alert severity="warning">{error}</Alert>}

      {!pool.patch && (
        <Alert severity="warning" title={t("patch.missingTitle")}>
          {t("patch.missingDescription")}
        </Alert>
      )}

      {pool.columns.every(
        (colonne) => colonne.champions.length === 0 && colonne.unavailableMembers.length === 0,
      ) && pool.catalog.length === 0 ? (
        <Card>
          <EmptyState
            title={t("roster.emptyTitle")}
            description={t("roster.emptyDescription")}
          />
        </Card>
      ) : (
        <Columns minWidth={260} count={5}>
          {pool.columns.map((colonne) => (
            <PoolColumn
              key={colonne.role}
              column={colonne}
              roleLabel={tTeams(`roles.${colonne.role}`)}
              canEdit={pool.viewerCanEdit}
              viewerMemberId={pool.viewerMemberId}
              onChoose={() => setPosteChoisi(colonne.role)}
            />
          ))}
        </Columns>
      )}

      <Text variant="caption" tone="secondary">
        {t("generatedAt", { date: formatDateTime(new Date(pool.generatedAt)) })}
      </Text>

      <ChampionPicker
        open={posteChoisi !== null}
        role={posteChoisi}
        catalog={pool.catalog}
        selected={colonneChoisie?.champions.map((champion) => champion.championKey) ?? []}
        saving={isSaving}
        onClose={() => setPosteChoisi(null)}
        onConfirm={(cles) =>
          void ecrit(() => setPoolChampionsApi(teamId, posteChoisi as GameRole, cles))
        }
      />
    </Stack>
  );
}

function PoolColumn({
  column,
  roleLabel,
  canEdit,
  viewerMemberId,
  onChoose,
}: {
  column: ChampionPoolColumnDto;
  roleLabel: string;
  canEdit: boolean;
  viewerMemberId: string | null;
  onChoose: () => void;
}) {
  const { t } = useTranslation("pool");

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} align="center" justify="between">
        <Text variant="section">{roleLabel}</Text>
        {canEdit && (
          <Button size="small" variant="ghost" onClick={onChoose}>
            {t("column.choose")}
          </Button>
        )}
      </Stack>

      {column.champions.length === 0 ? (
        <Card>
          <Stack spacing={0.5}>
            <Text variant="caption" tone="secondary">
              {t("column.empty")}
            </Text>
            {canEdit && (
              <Text variant="caption" tone="disabled">
                {t("column.emptyHint")}
              </Text>
            )}
          </Stack>
        </Card>
      ) : (
        column.champions.map((champion) => (
          <PoolChampionCard
            key={champion.championKey}
            champion={champion}
            viewerMemberId={viewerMemberId}
          />
        ))
      )}

      {column.hiddenByFloor > 0 && (
        <Text variant="caption" tone="secondary">
          {t("floor.hidden", { count: column.hiddenByFloor })}
        </Text>
      )}

      {column.unavailableMembers.length > 0 && (
        <Card title={t("unavailable.title")} description={t("unavailable.description")}>
          <Stack spacing={0.5}>
            {column.unavailableMembers.map((membre) => (
              <Stack key={membre.memberId} spacing={0}>
                <Text variant="body">
                  {membre.displayName ?? membre.riotGameName}
                  {membre.memberId === viewerMemberId ? ` (${t("member.viewer")})` : ""}
                </Text>
                <PoolStateNote state={membre.state} />
              </Stack>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
