import { useTranslation } from "react-i18next";
import { Avatar, Card, ChampionIcon, Chip, Stack, Text, Tooltip } from "../../../design-system";
import type { ChampionPoolEntryDto, ChampionPoolMemberDto } from "../../../types/pool";
import { useStatsFormat } from "../stats/statsFormat";

export interface PoolChampionCardProps {
  champion: ChampionPoolEntryDto;
  viewerMemberId: string | null;
}

const JOUEURS_VISIBLES = 3;
// En-tête + trois lignes joueur : toutes les cartes d'une colonne font la même hauteur.
const HAUTEUR = 236;

export function PoolChampionCard({ champion, viewerMemberId }: PoolChampionCardProps) {
  const { t } = useTranslation("pool");
  const format = useStatsFormat();

  const nom = champion.name ?? champion.championKey;
  const visibles = champion.players.slice(0, JOUEURS_VISIBLES);
  const caches = champion.players.slice(JOUEURS_VISIBLES);

  const ligne = (joueur: ChampionPoolMemberDto) =>
    t("champion.line", {
      level: joueur.masteryLevel ?? format.absent,
      points: format.compact(joueur.masteryPoints ?? 0),
      winRate: format.taux(joueur.winRate),
    });

  return (
    <Card minHeight={HAUTEUR}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} align="center">
          <ChampionIcon src={champion.iconUrl} name={nom} />
          <Stack spacing={0} fullWidth>
            <Text variant="subtitle" truncate>
              {nom}
            </Text>
            {!champion.name && (
              <Text variant="caption" tone="disabled">
                {t("champion.outOfCatalog")}
              </Text>
            )}
          </Stack>
          {caches.length > 0 && (
            <Tooltip title={caches.map((joueur) => joueur.displayName ?? joueur.riotGameName).join(", ")}>
              <Chip label={t("champion.more", { count: caches.length })} variant="outline" size="small" />
            </Tooltip>
          )}
        </Stack>

        {champion.players.length === 0 ? (
          <Text variant="caption" tone="disabled">
            {champion.setAsideByFloor > 0 ? t("champion.nobody") : t("champion.neverPicked")}
          </Text>
        ) : (
          <Stack spacing={0.75}>
            {visibles.map((joueur) => (
              <Stack key={joueur.memberId} direction="row" spacing={1} align="center">
                <Avatar src={joueur.avatarUrl} name={joueur.displayName ?? "?"} size="small" />
                <Stack spacing={0} fullWidth>
                  <Text variant="body" truncate>
                    {joueur.displayName ?? joueur.riotGameName}
                    {joueur.memberId === viewerMemberId ? ` (${t("member.viewer")})` : ""}
                    {joueur.status === "REMPLACANT" ? ` · ${t("member.substituteShort")}` : ""}
                  </Text>
                  <Tooltip
                    title={
                      joueur.games
                        ? t("champion.winRateDetail", {
                            rate: format.taux(joueur.winRate),
                            count: joueur.games,
                          })
                        : ""
                    }
                  >
                    <Text variant="caption" tone="secondary" mono>
                      {ligne(joueur)}
                    </Text>
                  </Tooltip>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
