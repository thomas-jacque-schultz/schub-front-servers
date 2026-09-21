import { useState } from "react";
import { useTranslation } from "react-i18next";
import { updateDisplayNameApi } from "../../api/profileApi";
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

/** Le cœur refuse au-delà ; on le dit pendant la saisie plutôt qu'après un aller-retour. */
const DISPLAY_NAME_MAX = 50;

/**
 * Mon profil — trois blocs, trois natures différentes.
 *
 * <ol>
 *   <li><strong>Discord</strong> : en lecture seule, parce que ces valeurs viennent de Discord et
 *     ne s'y changent pas d'ici. Les afficher modifiables ferait une promesse fausse.</li>
 *   <li><strong>Nom sur le site</strong> : la seule chose que l'on modifie librement.</li>
 *   <li><strong>Compte Riot</strong> : ni un champ ni un formulaire, mais un état à trois valeurs
 *     et les gestes qui vont avec.</li>
 * </ol>
 */
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

/** L'identité de connexion. Rien n'est modifiable ici, et l'écran le montre plutôt qu'il le dise. */
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

/**
 * Le compte Riot : un état, et les gestes que cet état autorise.
 *
 * <p><strong>Il n'y a pas de bouton « délier ».</strong> Ce n'est pas un oubli : une équipe
 * référence ses membres par leur compte, et retirer le lien laisserait ces places sans personne
 * derrière. Le geste offert est le <em>changement</em>, qui remplace sans jamais laisser vide —
 * et il est annoncé pour ce qu'il coûte, parce qu'il repart de zéro.</p>
 */
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

        {/* L'état intermédiaire mérite une explication, pas un badge orange muet : la saisie est
            conservée, et rejouer le même Riot ID relance la résolution. */}
        {riot.state === "EN_ATTENTE_DE_RESOLUTION" && (
          <Alert severity="warning">{t("riot.pendingExplanation")}</Alert>
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

/**
 * L'avancement de la collecte.
 *
 * <p>Trois cas, et pas deux : en cours, terminée, et **inconnue**. Le dernier arrive quand le
 * connecteur Riot ne répond pas ; le confondre avec « terminée » ferait disparaître l'indicateur
 * exactement quand on ne sait plus rien.</p>
 */
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
