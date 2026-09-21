import { useTranslation } from "react-i18next";
import { useLocaleFormat } from "../../../i18n/format";
import { Avatar, Card, Chip, Stack, Text } from "../../../design-system";
import type { ChampionPoolMemberDto } from "../../../types/pool";
import { ChampionMasteryLines } from "./ChampionMasteryLines";
import { PoolStateNote } from "./PoolStateNote";

export interface PoolMemberCardProps {
  member: ChampionPoolMemberDto;
  /** `member.memberId === pool.viewerMemberId` : un fait sur le lecteur, la seule comparaison permise. */
  isViewer: boolean;
}

export function PoolMemberCard({ member, isViewer }: PoolMemberCardProps) {
  const { t } = useTranslation("pool");
  const { formatDateTime } = useLocaleFormat();
  const nom = member.displayName ?? "";

  return (
    <Card>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} align="center" wrap>
          <Avatar src={member.avatarUrl} name={nom} size="medium" />
          <Stack spacing={0}>
            <Text variant="subtitle" truncate>
              {nom}
            </Text>
            {member.riotGameName && member.riotTagLine && (
              <Text variant="caption" tone="secondary">
                {`${member.riotGameName}#${member.riotTagLine}`}
              </Text>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={0.5} wrap>
          {isViewer && (
            <Chip label={t("member.viewer")} tone="primary" size="small" />
          )}
          {member.status === "REMPLACANT" && (
            <Chip
              label={t("member.substitute")}
              variant="outline"
              size="small"
            />
          )}
          {!member.linked && (
            <Chip label={t("member.free")} variant="outline" size="small" />
          )}
        </Stack>

        <PoolStateNote state={member.state} />

        {member.champions.length > 0 && (
          <ChampionMasteryLines champions={member.champions} />
        )}

        {member.observedAt && (
          <Text variant="caption" tone="secondary">
            {t("member.observedAt", {
              date: formatDateTime(new Date(member.observedAt)),
            })}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
