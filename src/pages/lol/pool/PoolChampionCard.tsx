import { useTranslation } from "react-i18next";
import { Avatar, Card, ChampionIcon, Chip, Stack, Text } from "../../../design-system";
import { useLocaleFormat } from "../../../i18n/format";
import type { ChampionPoolEntryDto } from "../../../types/pool";

export interface PoolChampionCardProps {
  champion: ChampionPoolEntryDto;
  viewerMemberId: string | null;
}

export function PoolChampionCard({ champion, viewerMemberId }: PoolChampionCardProps) {
  const { t } = useTranslation("pool");
  const { formatNumber } = useLocaleFormat();

  const nom = champion.name ?? champion.championKey;

  return (
    <Card>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} align="center">
          <ChampionIcon src={champion.iconUrl} name={nom} />
          <Stack spacing={0}>
            <Text variant="subtitle">{nom}</Text>
            {!champion.name && (
              <Text variant="caption" tone="disabled">
                {t("champion.outOfCatalog")}
              </Text>
            )}
          </Stack>
        </Stack>

        {champion.players.length === 0 ? (
          <Text variant="caption" tone="disabled">
            {champion.setAsideByFloor > 0 ? t("champion.nobody") : t("champion.neverPicked")}
          </Text>
        ) : (
          <Stack spacing={0.5}>
            {champion.players.map((joueur) => (
              <Stack key={joueur.memberId} direction="row" spacing={1} align="center">
                <Avatar src={joueur.avatarUrl} name={joueur.displayName ?? "?"} size="small" />
                <Stack spacing={0}>
                  <Text variant="body">
                    {joueur.displayName ?? joueur.riotGameName}
                    {joueur.memberId === viewerMemberId ? ` (${t("member.viewer")})` : ""}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {joueur.masteryLevel === null
                      ? t("champion.mastery", {
                          points: formatNumber(joueur.masteryPoints ?? 0),
                        })
                      : t("champion.masteryWithLevel", {
                          level: joueur.masteryLevel,
                          points: formatNumber(joueur.masteryPoints ?? 0),
                        })}
                  </Text>
                </Stack>
                {joueur.status === "REMPLACANT" && (
                  <Chip label={t("member.substitute")} variant="outline" size="small" />
                )}
              </Stack>
            ))}
          </Stack>
        )}

        {champion.setAsideByFloor > 0 && (
          <Text variant="caption" tone="disabled">
            {t("champion.setAside", { count: champion.setAsideByFloor })}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
