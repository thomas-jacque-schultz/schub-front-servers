import { useEffect, useMemo, useState } from "react";
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
import { getMyTeamsApi, type TeamSummaryDto } from "../lol";
import { useLocalizedNavigate } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";
import { useDocumentMeta } from "../seo/useDocumentMeta";

function HomePage() {
  const { t } = useTranslation("home");
  const navigate = useLocalizedNavigate();
  const { connected } = useAuthStore();
  const { profile, isLoading, error, ingestInFlight } = useProfileStore();
  const [equipes, setEquipes] = useState<TeamSummaryDto[]>([]);

  useEffect(() => {
    if (!connected) {
      setEquipes([]);
      return;
    }
    let vivant = true;
    getMyTeamsApi()
      .then((liste) => vivant && setEquipes(liste))
      .catch(() => undefined);
    return () => {
      vivant = false;
    };
  }, [connected]);

  useDocumentMeta({
    title: t("meta.title"),
    description: t("meta.description"),
  });

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
      items.push({
        key: "riot",
        label: t("onboarding.riotLinked"),
        state: "done",
      });
    }

    if (ingestInFlight) {
      items.push({
        key: "ingest",
        label: t("onboarding.ingestRunning"),
        description: t("onboarding.ingestRunningHint"),
        state: "pending",
        href: "/profile",
      });
    }

    items.push(
      equipes.length === 0
        ? {
            key: "team",
            label: t("onboarding.teamAbsent"),
            description: t("onboarding.teamAbsentHint"),
            state: "todo",
            href: "/lol/teams",
          }
        : {
            key: "team",
            label: t("onboarding.teamJoined", { count: equipes.length }),
            state: "done",
          },
    );

    return items;
  }, [profile, ingestInFlight, equipes, t]);

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
          <Text>{t("about.community")}</Text>
          <Text>{t("about.servers")}</Text>
          <Text>{t("about.lol")}</Text>
          <Text>{t("about.identity")}</Text>
          <Stack direction="responsive" spacing={1.5}>
            <Button onClick={() => navigate("/servers")}>
              {t("about.ctaServers")}
            </Button>
            <Button onClick={() => navigate("/lol")}>
              {t("about.ctaLol")}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {connected ? (
        <Card title={t("onboarding.title")} description={t("onboarding.intro")}>
          <Stack spacing={2}>
            {isLoading && !profile && (
              <ProgressBar label={t("onboarding.loading")} />
            )}
            {error && !profile && (
              <Alert severity="warning">{t("onboarding.unavailable")}</Alert>
            )}
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
              <Button onClick={() => navigate("/login")}>
                {t("onboarding.signIn")}
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

export default HomePage;
