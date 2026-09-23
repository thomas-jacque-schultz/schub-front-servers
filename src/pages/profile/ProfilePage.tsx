import { useState } from "react";
import { useTranslation } from "react-i18next";
import { linkRiotAccountApi, updateDisplayNameApi } from "../../api/profileApi";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  PageHeader,
  ProgressBar,
  Stack,
  Text,
  TextField,
  Toast,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { useProfileStore } from "../../stores/profileStore";
import { RiotAccountDialog } from "./RiotAccountDialog";
import type { ProfileDto } from "../../types/profile";

const DISPLAY_NAME_MAX = 50;

function ProfilePage() {
  const { t } = useTranslation("profile");
  const { profile, isLoading, error, setProfile } = useProfileStore();
  const [toast, setToast] = useState<string>("");

  if (isLoading && !profile) {
    return <ProgressBar label={t("title")} />;
  }

  if (!profile) {
    return <Alert severity="error">{error || t("loadFailed")}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <DiscordCard profile={profile} />
      <DisplayNameCard
        profile={profile}
        onSaved={(next) => {
          setProfile(next);
          setToast(t("displayName.saved"));
        }}
      />
      <RiotAccountCard profile={profile} onChanged={setProfile} />

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </Stack>
  );
}

function DiscordCard({ profile }: { profile: ProfileDto }) {
  const { t } = useTranslation("profile");

  return (
    <Card title={t("discord.title")} description={t("discord.description")}>
      <Stack direction="responsive" spacing={2} align="center">
        <Avatar src={profile.discord.avatarUrl} name={profile.discord.username} />
        <Stack spacing={0.5} fullWidth>
          <Text variant="subtitle">{profile.discord.username}</Text>
          <Text variant="caption" tone="secondary">
            {t("discord.id")} : {profile.discord.id}
          </Text>
          <Text variant="caption" tone="secondary">
            {t("discord.idHelper")}
          </Text>
        </Stack>
        <Chip label={`${t("discord.role")} : ${profile.role.name}`} tone="secondary" variant="outline" />
      </Stack>
    </Card>
  );
}

function DisplayNameCard({
  profile,
  onSaved,
}: {
  profile: ProfileDto;
  onSaved: (profile: ProfileDto) => void;
}) {
  const { t } = useTranslation("profile");
  const [value, setValue] = useState<string>(profile.displayName);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const tooLong = value.length > DISPLAY_NAME_MAX;
  const unchanged = value.trim() === profile.displayName;

  const onSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      onSaved(await updateDisplayNameApi(value.trim()));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("displayName.failed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card title={t("displayName.title")} description={t("displayName.description")}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label={t("displayName.field")}
          value={value}
          onChange={setValue}
          error={tooLong}
          helperText={tooLong ? t("displayName.tooLong") : t("displayName.helper")}
        />
        <Stack direction="row" justify="end">
          <Button
            onClick={() => void onSave()}
            disabled={tooLong || unchanged}
            loading={isSaving}
          >
            {t("displayName.save")}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

function RiotAccountCard({
  profile,
  onChanged,
}: {
  profile: ProfileDto;
  onChanged: (profile: ProfileDto) => void;
}) {
  const { t } = useTranslation("profile");
  const { formatDateTime } = useLocaleFormat();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const onRetry = async (riotId: string) => {
    setIsRetrying(true);
    try {
      onChanged(await linkRiotAccountApi(riotId));
    } catch {
      // La déclaration reste conservée, en attente.
    } finally {
      setIsRetrying(false);
    }
  };

  const { riot } = profile;
  const linked = riot.state !== "ABSENT";

  const tone = riot.state === "RESOLU" ? "success" : riot.state === "ABSENT" ? "neutral" : "warning";

  return (
    <Card
      title={t("riot.title")}
      description={t("riot.description")}
      actions={
        <Button variant={linked ? "secondary" : "primary"} onClick={() => setIsDialogOpen(true)}>
          {linked ? t("riot.change.action") : t("riot.link.action")}
        </Button>
      }
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} align="center" wrap>
          <Chip label={t(`riot.state.${riot.state}`)} tone={tone} variant="outline" />
          {riot.riotId && <Text variant="subtitle">{riot.riotId}</Text>}
        </Stack>

        {riot.linkedAt && (
          <Text variant="caption" tone="secondary">
            {t("riot.linkedAt", { date: formatDateTime(new Date(riot.linkedAt)) })}
          </Text>
        )}

        {riot.state === "EN_ATTENTE_DE_RESOLUTION" && (
          <Alert severity="warning">
            <Stack spacing={1}>
              <Text variant="caption">{t("riot.pendingExplanation")}</Text>
              {riot.riotId && (
                <Stack direction="row">
                  <Button
                    variant="secondary"
                    size="small"
                    loading={isRetrying}
                    onClick={() => void onRetry(riot.riotId as string)}
                  >
                    {t("riot.retry")}
                  </Button>
                </Stack>
              )}
            </Stack>
          </Alert>
        )}

        <IngestState profile={profile} />

        {linked && (
          <Text variant="caption" tone="secondary">
            {t("riot.change.noUnlink")}
          </Text>
        )}
      </Stack>

      <RiotAccountDialog
        open={isDialogOpen}
        currentRiotId={linked ? riot.riotId : null}
        onClose={() => setIsDialogOpen(false)}
        onLinked={onChanged}
      />
    </Card>
  );
}

function IngestState({ profile }: { profile: ProfileDto }) {
  const { t } = useTranslation("profile");
  const { formatDateTime } = useLocaleFormat();

  const { riot } = profile;

  if (riot.state !== "RESOLU") {
    return null;
  }

  if (!riot.ingest) {
    return <Alert severity="info">{t("riot.ingest.unavailable")}</Alert>;
  }

  if (riot.ingest.running === 0 && riot.ingest.pending === 0) {
    return null;
  }

  return (
    <Alert severity="info" title={t("riot.ingest.title")}>
      <Stack spacing={1}>
        <Text variant="caption">{t("riot.ingest.running")}</Text>
        <Text variant="caption" tone="secondary">
          {t("riot.ingest.pending", { count: riot.ingest.pending })}
        </Text>
        <Text variant="caption" tone="secondary">
          {riot.ingest.estimatedReadyAt
            ? t("riot.ingest.readyAt", {
                date: formatDateTime(new Date(riot.ingest.estimatedReadyAt)),
              })
            : t("riot.ingest.readyUnknown")}
        </Text>
        <ProgressBar label={t("riot.ingest.title")} />
      </Stack>
    </Alert>
  );
}

export default ProfilePage;
