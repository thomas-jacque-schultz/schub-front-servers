import { useTranslation } from "react-i18next";
import { useLocaleFormat } from "../../../i18n/format";
import { Avatar, Stack, Text, Tooltip } from "../../../design-system";
import type { ChampionPoolEntryDto } from "../../../types/pool";

export interface ChampionMasteryLinesProps {
  champions: ChampionPoolEntryDto[];
}

/**
 * Les champions d'un membre, du plus maîtrisé au moins maîtrisé — l'ordre du serveur, conservé.
 *
 * <p>Une entrée sans nom est un champion absent du catalogue de ce patch, pas une donnée
 * manquante : on affiche son identifiant plutôt que de faire disparaître une maîtrise réelle.</p>
 */
export function ChampionMasteryLines({ champions }: ChampionMasteryLinesProps) {
  const { t } = useTranslation("pool");
  const { formatNumber, formatDate } = useLocaleFormat();

  return (
    <Stack spacing={1}>
      {champions.map((champion) => {
        const inconnu = champion.name === null;
        const nom = inconnu
          ? t("member.unknownChampion", { id: champion.championId })
          : (champion.name as string);
        return (
          <Stack
            key={champion.championId}
            direction="row"
            spacing={1}
            align="center"
          >
            <Avatar src={champion.iconUrl} name={nom} size="medium" />
            <Stack spacing={0} fullWidth>
              {inconnu ? (
                <Tooltip title={t("member.unknownChampionHint")}>
                  <Text variant="body" truncate>
                    {nom}
                  </Text>
                </Tooltip>
              ) : (
                <Text variant="body" truncate>
                  {nom}
                </Text>
              )}
              <Text variant="caption" tone="secondary">
                {t("member.mastery", {
                  level: champion.masteryLevel,
                  points: formatNumber(champion.masteryPoints),
                })}
                {champion.lastPlayedAt
                  ? ` · ${t("member.lastPlayed", {
                      date: formatDate(new Date(champion.lastPlayedAt)),
                    })}`
                  : ""}
              </Text>
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
