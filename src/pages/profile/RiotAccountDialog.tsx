import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "../../api/httpClient";
import { RiotAccountChangeRequired, linkRiotAccountApi } from "../../api/profileApi";
import { claimTeamsApi, RiotAccountPicker } from "../../lol";
import { Alert, Button, Dialog, Stack, Text } from "../../design-system";
import { durationToMinutes } from "./duration";
import type { ProfileDto, RiotAccountChangeDto } from "../../types/profile";

interface RiotAccountDialogProps {
  open: boolean;
  currentRiotId: string | null;
  onClose: () => void;
  onLinked: (profile: ProfileDto) => void;
}

export function RiotAccountDialog({
  open,
  currentRiotId,
  onClose,
  onLinked,
}: RiotAccountDialogProps) {
  const { t } = useTranslation("profile");

  const [pending, setPending] = useState<{ riotId: string; change: RiotAccountChangeDto } | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const isChange = currentRiotId !== null;

  const messageDeRefus = (cause: unknown): string => {
    // Le statut et non le texte du serveur : le cœur répond en français.
    if (cause instanceof ApiError && cause.status === 409) {
      return t("riot.link.conflict");
    }
    return cause instanceof Error ? cause.message : t("riot.link.failed");
  };

  const lier = async (riotId: string, confirmChange: boolean) => {
    setIsSaving(true);
    setError("");

    try {
      const profil = await linkRiotAccountApi(riotId, confirmChange);

      // Rattache les places d'effectif laissées à ce Riot ID ; son échec n'annule pas la liaison.
      await claimTeamsApi().catch(() => undefined);

      onLinked(profil);
      onClose();
    } catch (linkError) {
      if (linkError instanceof RiotAccountChangeRequired) {
        setPending({ riotId, change: linkError.change });
      } else {
        setError(messageDeRefus(linkError));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      title={isChange ? t("riot.change.title") : t("riot.link.title")}
      description={isChange && !pending ? t("riot.change.description") : undefined}
      cancelLabel={t("actions.cancel", { ns: "common" })}
      confirmLabel={pending ? t("riot.change.confirm") : undefined}
      confirmLoading={isSaving}
      destructive={Boolean(pending)}
      onClose={onClose}
      onConfirm={pending ? () => void lier(pending.riotId, true) : undefined}
    >
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}

        {pending ? (
          <Stack spacing={2}>
            <Stack direction="row">
              <Button
                variant="ghost"
                onClick={() => {
                  setPending(null);
                  setError("");
                }}
              >
                {t("actions.back", { ns: "common" })}
              </Button>
            </Stack>
            <Text variant="caption" tone="secondary">
              {t("riot.change.from")} : {currentRiotId} — {t("riot.change.to")} : {pending.riotId}
            </Text>
            <ChangeConsequences change={pending.change} />
          </Stack>
        ) : (
          <RiotAccountPicker
            resetKey={open}
            busy={isSaving}
            onPick={(account) => void lier(account.riotId, false)}
          />
        )}
      </Stack>
    </Dialog>
  );
}

function ChangeConsequences({ change }: { change: RiotAccountChangeDto }) {
  const { t } = useTranslation("profile");

  const minutes = durationToMinutes(change.estimatedDuration);

  const lines: string[] = [];

  if (change.statsReset) {
    lines.push(t("riot.change.statsReset"));
  }
  if (change.ingestRestarted) {
    lines.push(t("riot.change.ingestRestarted"));
  }
  if (change.estimatedMatches > 0) {
    lines.push(t("riot.change.estimatedMatches", { count: change.estimatedMatches }));
  }
  if (minutes !== null && minutes > 0) {
    lines.push(t("riot.change.estimatedDuration", { count: minutes }));
  }
  if (change.rosterSlotsToClaim) {
    lines.push(t("riot.change.rosterSlotsToClaim"));
  }

  if (lines.length === 0) {
    return <Alert severity="warning">{t("riot.change.unknownConsequences")}</Alert>;
  }

  return (
    <Alert severity="warning" title={t("riot.change.consequencesTitle")}>
      <Stack spacing={0.5} component="ul">
        {lines.map((line) => (
          <Text key={line} component="li" variant="caption">
            {line}
          </Text>
        ))}
      </Stack>
    </Alert>
  );
}
