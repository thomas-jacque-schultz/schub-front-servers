import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Stack, Switch, Text, Toast } from "../../../common";
import { setMemberHiddenApi, setTeamPublicApi } from "../../api/teamsApi";
import type { TeamDto } from "../../types/team";

/** Ouvrir la page publique (le créateur), masquer son propre nom (chaque membre), partager le lien ou la carte. */
export function TeamSharing({
  team,
  onTeamChange,
}: {
  team: TeamDto;
  onTeamChange: (team: TeamDto) => void;
}) {
  const { t } = useTranslation("teams");
  const [toast, setToast] = useState<string>("");
  const moi = team.members.find((m) => m.memberId === team.viewerMemberId);
  const lien = `${window.location.origin}/teams/${team.id}`;

  if (!team.viewerCanManage && !team.publicPage) {
    return null;
  }

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(lien);
      setToast(t("public.share.copied"));
    } catch {
      setToast(lien);
    }
  };

  return (
    <Card title={t("public.share.title")}>
      <Stack spacing={1.5}>
        {team.viewerCanManage && (
          <Switch
            checked={Boolean(team.publicPage)}
            onChange={(value) =>
              void setTeamPublicApi(team.id, value).then(onTeamChange)
            }
            label={t("public.share.toggle")}
            helperText={t("public.share.toggleHelper")}
          />
        )}
        {team.publicPage && moi && (
          <Switch
            checked={Boolean(moi.hiddenOnPublicPage)}
            onChange={(value) =>
              void setMemberHiddenApi(team.id, moi.memberId, value).then(
                onTeamChange,
              )
            }
            label={t("public.share.hideMe")}
          />
        )}
        {team.publicPage && (
          <Stack direction="row" spacing={1} align="center" wrap>
            <Text variant="caption" mono>
              {lien}
            </Text>
            <Button
              size="small"
              variant="secondary"
              onClick={() => void copier()}
            >
              {t("public.share.copy")}
            </Button>
            <Button
              size="small"
              variant="ghost"
              onClick={() =>
                window.open(`/api/seo/teams/${team.id}/card.png`, "_blank")
              }
            >
              {t("public.share.card")}
            </Button>
          </Stack>
        )}
      </Stack>
      <Toast
        open={Boolean(toast)}
        message={toast}
        onClose={() => setToast("")}
      />
    </Card>
  );
}
