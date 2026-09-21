import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  PageHeader,
  ProgressBar,
  Stack,
  TaskList,
  type TaskListItem,
  Text,
} from "../design-system";
import { useLocalizedNavigate } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";
import { useDocumentMeta } from "../seo/useDocumentMeta";

/**
 * La racine : ce qu'est Schub, puis ce qu'il reste à faire pour s'en servir.
 *
 * <p>Le contenu personnel a déménagé sur `/contact`. Ce qui restait ici — l'encadré Schub — est
 * devenu la page : un visiteur qui arrive sur le domaine doit lire à quoi sert ce site, et un
 * compte connecté doit voir ce qui l'empêche encore d'en profiter.</p>
 *
 * <p>Les actions sont <strong>déduites de `GET /me`</strong>, jamais devinées. Un visiteur non
 * connecté n'a pas de liste vide : il a la seule action qui le concerne, se connecter.</p>
 */
function HomePage() {
  const { t } = useTranslation("home");
  const navigate = useLocalizedNavigate();
  const { connected, canAny } = useAuthStore();
  const { profile, isLoading, error, ingestInFlight } = useProfileStore();

  useDocumentMeta({ title: t("meta.title"), description: t("meta.description") });

  const taches = useMemo<TaskListItem[]>(() => {
    if (!profile) {
      return [];
    }

    const items: TaskListItem[] = [];

    if (profile.riot.state === "ABSENT") {
      items.push({
        key: "riot",
        label: t("onboarding.riotAbsent"),
        description: t("onboarding.riotAbsentHint"),
        state: "todo",
        href: "/profile",
      });
    } else if (profile.riot.state === "EN_ATTENTE_DE_RESOLUTION") {
      items.push({
        key: "riot",
        label: t("onboarding.riotPending"),
        description: t("onboarding.riotPendingHint"),
        state: "pending",
        href: "/profile",
      });
    } else {
      items.push({ key: "riot", label: t("onboarding.riotLinked"), state: "done" });
    }

    // La collecte n'est pas une action : rien n'est demandé, il n'y a qu'à attendre. Elle est
    // listée quand même, parce que des statistiques vides pendant ce temps se lisent comme une
    // panne si personne ne dit qu'elles se remplissent.
    if (ingestInFlight) {
      items.push({
        key: "ingest",
        label: t("onboarding.ingestRunning"),
        description: t("onboarding.ingestRunningHint"),
        state: "pending",
        href: "/profile",
      });
    }

    if (!profile.displayNameChosen) {
      items.push({
        key: "displayName",
        label: t("onboarding.displayName"),
        description: t("onboarding.displayNameHint"),
        state: "todo",
        href: "/profile",
      });
    }

    return items;
  }, [profile, ingestInFlight, t]);

  const resteAFaire = taches.some((tache) => tache.state !== "done");

  return (
    <Stack spacing={4}>
      <PageHeader
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
      />

      <Card title={t("about.title")}>
        <Stack spacing={2}>
          <Text>{t("about.servers")}</Text>
          <Text>{t("about.lol")}</Text>
          <Text>{t("about.identity")}</Text>
          <Stack direction="responsive" spacing={1.5}>
            <Button onClick={() => navigate("/servers")}>{t("about.ctaServers")}</Button>
            {connected && canAny("TEAM_CREATE", "TEAM_VIEW") && (
              <Button variant="secondary" onClick={() => navigate("/lol")}>
                {t("about.ctaTeams")}
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>

      {connected ? (
        <Card title={t("onboarding.title")} description={t("onboarding.intro")}>
          <Stack spacing={2}>
            {isLoading && !profile && <ProgressBar label={t("onboarding.loading")} />}
            {error && !profile && <Alert severity="warning">{t("onboarding.unavailable")}</Alert>}
            <TaskList
              items={taches}
              onSelect={(href) => navigate(href)}
              doneLabel={t("onboarding.allDone")}
            />
            {profile && !resteAFaire && (
              <Text tone="secondary">{t("onboarding.allDone")}</Text>
            )}
          </Stack>
        </Card>
      ) : (
        <Card title={t("onboarding.signedOutTitle")}>
          <Stack spacing={2}>
            <Text>{t("onboarding.signedOutBody")}</Text>
            <Stack direction="row">
              <Button onClick={() => navigate("/login")}>{t("onboarding.signIn")}</Button>
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

export default HomePage;
