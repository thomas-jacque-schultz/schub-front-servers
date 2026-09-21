import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  Stack,
  Text,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { useLocalizedNavigate } from "../../i18n/navigation";
import { useProfileStore } from "../../stores/profileStore";

/**
 * Tant qu'une collecte tourne, on redemande où elle en est. Une échéance figée à l'ouverture de
 * l'écran vieillit mal : au bout de dix minutes elle annonce un passé.
 */
const INGEST_POLL_MS = 30_000;

/**
 * Mes stats — **l'accès, l'état et l'attente**. Pas les graphiques.
 *
 * <p>Les statistiques personnelles viennent dans un lot suivant. Ce qui est livré ici est ce qui
 * doit exister avant elles : savoir si l'écran est ouvert, pourquoi il ne l'est pas, et quand les
 * données seront là.</p>
 *
 * <p><strong>La garde est ici autant que dans le menu.</strong> Une URL se tape à la main et se
 * met en favori : l'entrée grisée ne suffit pas, l'écran doit refuser lui-même — et refuser en
 * expliquant, avec le chemin vers ce qui débloque.</p>
 *
 * <p>Aucune donnée simulée n'entre ici, même « pour voir ». Un chiffre inventé est lu comme vrai,
 * et il survit à celui qui l'a posé.</p>
 */
function StatsPage() {
  const { t } = useTranslation("stats");
  const { formatDateTime } = useLocaleFormat();
  const navigate = useLocalizedNavigate();
  const { profile, isLoading, reload, ingestInFlight } = useProfileStore();

  /** On ne sonde que pendant la collecte : sinon c'est une requête toutes les trente secondes
      pour apprendre que rien n'a changé. */
  useEffect(() => {
    if (!ingestInFlight) {
      return;
    }

    const timer = setInterval(() => void reload(), INGEST_POLL_MS);
    return () => clearInterval(timer);
  }, [ingestInFlight, reload]);

  if (isLoading && !profile) {
    return <ProgressBar label={t("title")} />;
  }

  const riot = profile?.riot;

  const header = <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />;

  if (!riot || riot.state === "ABSENT") {
    return (
      <Stack spacing={3}>
        {header}
        <Card>
          <EmptyState
            title={t("locked.title")}
            description={t("locked.description")}
            action={<Button onClick={() => navigate("/profile")}>{t("locked.action")}</Button>}
          />
        </Card>
      </Stack>
    );
  }

  if (riot.state === "EN_ATTENTE_DE_RESOLUTION") {
    return (
      <Stack spacing={3}>
        {header}
        <Card>
          <EmptyState
            title={t("pending.title")}
            description={t("pending.description")}
            action={
              <Button variant="secondary" onClick={() => navigate("/profile")}>
                {t("pending.action")}
              </Button>
            }
          />
        </Card>
      </Stack>
    );
  }

  // Compte lié : reste à savoir si les données sont arrivées.
  if (!riot.ingest) {
    return (
      <Stack spacing={3}>
        {header}
        <Alert severity="info" title={t("unavailable.title")}>
          {t("unavailable.description")}
        </Alert>
      </Stack>
    );
  }

  if (riot.ingest.running > 0 || riot.ingest.pending > 0) {
    return (
      <Stack spacing={3}>
        {header}
        <Card title={t("waiting.title")} description={t("waiting.description")}>
          <Stack spacing={1.5}>
            <ProgressBar label={t("waiting.progressLabel")} />
            <Text variant="caption" tone="secondary">
              {t("waiting.pending", { count: riot.ingest.pending })}
            </Text>
            {/* `estimatedReadyAt` est le chiffre utile : « 4 300 en attente » ne dit rien,
                « prêt vers 15 h 20 » si. */}
            <Text variant="subtitle">
              {riot.ingest.estimatedReadyAt
                ? t("waiting.readyAt", {
                    date: formatDateTime(new Date(riot.ingest.estimatedReadyAt)),
                  })
                : t("waiting.readyUnknown")}
            </Text>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {header}
      <Card>
        <EmptyState
          title={t("soon.title")}
          description={t("soon.description")}
          action={
            <Button variant="secondary" onClick={() => navigate("/lol")}>
              {t("soon.teams")}
            </Button>
          }
        />
      </Card>
    </Stack>
  );
}

export default StatsPage;
