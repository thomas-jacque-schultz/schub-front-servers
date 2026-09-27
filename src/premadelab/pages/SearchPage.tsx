import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  PageHeader,
  Stack,
  TaskList,
  type TaskListItem,
  useAuthStore,
  useDocumentMeta,
  useLocalizedNavigate,
  useProfileStore,
} from "../../common";
import { getMyTeamsApi } from "../api/teamsApi";
import { JoinCta } from "../components/JoinCta";
import { PlayerSearch } from "../components/PlayerSearch";

/** L'accueil de PremadeLab : chercher un joueur. Connecté, ce qu'il reste à faire pour en tirer tout. */
function SearchPage() {
  const { t } = useTranslation("lol");
  const navigate = useLocalizedNavigate();
  const { connected } = useAuthStore();
  const { profile, ingestInFlight } = useProfileStore();
  const [equipes, setEquipes] = useState<number | null>(null);

  useDocumentMeta({
    title: t("search.metaTitle"),
    description: t("search.metaDescription"),
  });

  useEffect(() => {
    if (!connected) {
      setEquipes(null);
      return;
    }
    let vivant = true;
    getMyTeamsApi()
      .then((liste) => vivant && setEquipes(liste.length))
      .catch(() => undefined);
    return () => {
      vivant = false;
    };
  }, [connected]);

  const taches: TaskListItem[] = [];
  if (profile) {
    const etat = profile.riot.state;
    taches.push({
      key: "riot",
      label:
        etat === "ABSENT"
          ? t("onboarding.riotAbsent", { ns: "home" })
          : etat === "EN_ATTENTE_DE_RESOLUTION"
            ? t("onboarding.riotPending", { ns: "home" })
            : t("onboarding.riotLinked", { ns: "home" }),
      state:
        etat === "ABSENT"
          ? "todo"
          : etat === "EN_ATTENTE_DE_RESOLUTION"
            ? "pending"
            : "done",
      href: etat === "RESOLU" ? undefined : "/profile",
    });
    if (ingestInFlight) {
      taches.push({
        key: "ingest",
        label: t("onboarding.ingestRunning", { ns: "home" }),
        description: t("onboarding.ingestRunningHint", { ns: "home" }),
        state: "pending",
        href: "/profile",
      });
    }
    if (equipes !== null) {
      taches.push(
        equipes === 0
          ? {
              key: "team",
              label: t("onboarding.teamAbsent", { ns: "home" }),
              description: t("onboarding.teamAbsentHint", { ns: "home" }),
              state: "todo",
              href: "/teams",
            }
          : {
              key: "team",
              label: t("onboarding.teamJoined", { ns: "home", count: equipes }),
              state: "done",
            },
      );
    }
  }
  const resteAFaire = taches.some((tache) => tache.state !== "done");

  return (
    <Stack spacing={4}>
      <PageHeader
        eyebrow={t("search.eyebrow")}
        title={t("search.title")}
        subtitle={t("search.subtitle")}
      />
      <Card>
        <PlayerSearch />
      </Card>
      <JoinCta />
      {resteAFaire && (
        <Card
          title={t("onboarding.title", { ns: "home" })}
          description={t("onboarding.intro", { ns: "home" })}
        >
          <TaskList
            items={taches}
            onSelect={(href) => navigate(href)}
            doneLabel={t("onboarding.allDone", { ns: "home" })}
          />
        </Card>
      )}
    </Stack>
  );
}

export default SearchPage;
