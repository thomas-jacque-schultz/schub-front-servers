import { useTranslation } from "react-i18next";
import {
  BulletList,
  Button,
  Card,
  Columns,
  Link,
  PageHeader,
  RiotDisclaimer,
  Stack,
  Text,
  useAuthStore,
  useDocumentMeta,
  useHistoryWindow,
  useLocalizedNavigate,
  useLocalizedPath,
  useProfileStore,
} from "../../common";

function LolLandingPage() {
  const { t } = useTranslation("lol");
  const navigate = useLocalizedNavigate();
  const localize = useLocalizedPath();
  const { connected, canAny } = useAuthStore();
  const { riotLinked } = useProfileStore();
  const historyWindow = useHistoryWindow();

  useDocumentMeta({
    title: t("meta.title"),
    description: t("meta.description"),
  });

  const fonctionnalites = [
    {
      key: "search",
      title: t("features.search.title"),
      body: t("features.search.body"),
    },
    {
      key: "roster",
      title: t("features.roster.title"),
      body: t("features.roster.body"),
    },
    {
      key: "collect",
      title: t("features.collect.title"),
      body: t("features.collect.body"),
    },
    {
      key: "playerStats",
      title: t("features.playerStats.title"),
      body: t("features.playerStats.body"),
    },
    {
      key: "teamStats",
      title: t("features.teamStats.title"),
      body: t("features.teamStats.body"),
    },
    {
      key: "pool",
      title: t("features.pool.title"),
      body: t("features.pool.body"),
    },
    {
      key: "draft",
      title: t("features.draft.title"),
      body: t("features.draft.body"),
    },
  ];

  return (
    <Stack spacing={4}>
      <PageHeader
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
      />

      <Card title={t("intro.title")}>
        <Stack spacing={2}>
          <Text>{t("intro.p1")}</Text>
          <Text>{t("intro.p2")}</Text>
          <Text>{t("intro.p3")}</Text>
        </Stack>
      </Card>

      <Stack spacing={2}>
        <Text variant="title">{t("features.title")}</Text>
        <Text tone="secondary">{t("features.intro")}</Text>
        <Columns minWidth={320}>
          {fonctionnalites.map((fonctionnalite) => (
            <Card key={fonctionnalite.key} title={fonctionnalite.title}>
              <Text>{fonctionnalite.body}</Text>
            </Card>
          ))}
        </Columns>
      </Stack>

      <Card title={t("limits.title")} description={t("limits.intro")}>
        <BulletList
          items={[
            historyWindow
              ? t("limits.history", { ...historyWindow })
              : t("limits.historyUnknown"),
            t("limits.noWorldStats"),
            t("limits.noProbe"),
            t("limits.noLive"),
            t("limits.collectTime"),
          ]}
        />
      </Card>

      <Card title={t("access.title")}>
        {connected ? (
          <Stack spacing={2}>
            <Text>{t("access.signedInBody")}</Text>
            {!canAny("TEAM_CREATE", "TEAM_VIEW") && (
              <Text tone="secondary">{t("access.noTeamPermission")}</Text>
            )}
            <Stack direction="responsive" spacing={1.5}>
              {canAny("TEAM_CREATE", "TEAM_VIEW") && (
                <Button onClick={() => navigate("/teams")}>
                  {t("access.ctaTeams")}
                </Button>
              )}
              {riotLinked ? (
                <Button variant="secondary" onClick={() => navigate("/stats")}>
                  {t("access.ctaStats")}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => navigate("/profile")}
                >
                  {t("access.ctaProfile")}
                </Button>
              )}
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Text>{t("access.signedOutBody")}</Text>
            <Stack direction="row">
              <Button onClick={() => navigate("/login")}>
                {t("access.ctaSignIn")}
              </Button>
            </Stack>
          </Stack>
        )}
      </Card>

      <RiotDisclaimer />

      <Card title={t("legal.title")}>
        <Stack spacing={1.5}>
          <Text>{t("legal.data")}</Text>
          <Stack direction="responsive" spacing={2}>
            <Link href={localize("/terms")}>{t("legal.terms")}</Link>
            <Link href={localize("/privacy")}>{t("legal.privacy")}</Link>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}

export default LolLandingPage;
