import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getChampionPoolApi } from "../../../api/poolApi";
import {
  Alert,
  Card,
  Chip,
  Columns,
  EmptyState,
  ProgressBar,
  SelectField,
  Stack,
  Text,
} from "../../../design-system";
import { useLocaleFormat } from "../../../i18n/format";
import type { ChampionPoolDto } from "../../../types/pool";
import { PoolMemberCard } from "./PoolMemberCard";

export interface PoolPanelProps {
  teamId: string;
}

const PAR_MEMBRE = [5, 10, 20, 50];

/**
 * <strong>Panneau « pool de champions »</strong> — cinq colonnes, une par poste.
 *
 * <p>Les colonnes viennent du serveur et sont toujours les cinq, y compris celles que personne ne
 * tient : une colonne absente décalerait la page. Chaque membre porte un `state` qui dit pourquoi
 * il n'a pas de champion, et il est rendu même sans aucun — un joueur qui disparaît se cherche
 * pendant dix minutes.</p>
 */
export function PoolPanel({ teamId }: PoolPanelProps) {
  const { t } = useTranslation("pool");
  const { t: tTeams } = useTranslation("teams");
  const { formatDateTime } = useLocaleFormat();

  const [parMembre, setParMembre] = useState<string>("10");
  const [pool, setPool] = useState<ChampionPoolDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setPool(await getChampionPoolApi(teamId, Number(parMembre)));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("loadFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [teamId, parMembre, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const options = useMemo(
    () =>
      PAR_MEMBRE.map((valeur) => ({
        value: String(valeur),
        label: String(valeur),
      })),
    [],
  );

  if (isLoading && !pool) {
    return <ProgressBar label={t("loading")} />;
  }

  if (error && !pool) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!pool) {
    return null;
  }

  const effectif =
    pool.columns.reduce((total, colonne) => total + colonne.members.length, 0) +
    pool.membersWithoutRole.length;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} align="center" wrap>
        <SelectField
          label={t("perMember.label")}
          value={parMembre}
          onChange={setParMembre}
          options={options}
          helperText={t("perMember.helper")}
        />
        {pool.patch && <Chip label={t("patch.label", { version: pool.patch })} />}
        <Text variant="caption" tone="secondary">
          {t("perMember.applied", { count: pool.championsPerMember })}
        </Text>
      </Stack>

      {error && <Alert severity="warning">{error}</Alert>}

      {/* Pas de patch, pas un seul champion : c'est la règle du cœur, et elle se dit une fois
          pour tout le panneau plutôt que cinq fois dans cinq colonnes. */}
      {!pool.patch && (
        <Alert severity="warning" title={t("patch.missingTitle")}>
          {t("patch.missingDescription")}
        </Alert>
      )}

      {effectif === 0 ? (
        <Card>
          <EmptyState
            title={t("roster.emptyTitle")}
            description={t("roster.emptyDescription")}
          />
        </Card>
      ) : (
        <Columns minWidth={260}>
          {pool.columns.map((colonne) => (
            <Stack key={colonne.role} spacing={1}>
              <Text variant="section">{tTeams(`roles.${colonne.role}`)}</Text>
              {colonne.members.length === 0 ? (
                <Card>
                  <Text variant="caption" tone="secondary">
                    {t("column.empty")}
                  </Text>
                </Card>
              ) : (
                colonne.members.map((membre) => (
                  <PoolMemberCard
                    key={membre.memberId}
                    member={membre}
                    isViewer={membre.memberId === pool.viewerMemberId}
                  />
                ))
              )}
            </Stack>
          ))}
        </Columns>
      )}

      {pool.membersWithoutRole.length > 0 && (
        <Card
          title={t("withoutRole.title")}
          description={t("withoutRole.description")}
        >
          <Columns minWidth={260}>
            {pool.membersWithoutRole.map((membre) => (
              <PoolMemberCard
                key={membre.memberId}
                member={membre}
                isViewer={membre.memberId === pool.viewerMemberId}
              />
            ))}
          </Columns>
        </Card>
      )}

      <Text variant="caption" tone="secondary">
        {t("generatedAt", {
          date: formatDateTime(new Date(pool.generatedAt)),
        })}
      </Text>
    </Stack>
  );
}
