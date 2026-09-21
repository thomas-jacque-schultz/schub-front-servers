import { useTranslation } from "react-i18next";
import {
  BulletList,
  Button,
  Card,
  Columns,
  Link,
  PageHeader,
  Stack,
  Text,
} from "../../design-system";
import { RiotDisclaimer } from "../legal/RiotDisclaimer";
import { useLocalizedNavigate, useLocalizedPath } from "../../i18n/navigation";
import { useAuthStore } from "../../stores/authStore";
import { useProfileStore } from "../../stores/profileStore";
import { useDocumentMeta } from "../../seo/useDocumentMeta";

/**
 * La vitrine publique de l'outil League of Legends.
 *
 * <p><strong>Cette page est publique, et c'est sa raison d'être.</strong> `/lol` servait la liste
 * des équipes derrière une session : un visiteur — un examinateur du portail développeur de Riot
 * en particulier — n'y lisait qu'un écran de connexion, donc rien de ce que le produit fait. La
 * liste des équipes a pris l'adresse `/lol/teams`, qui dit ce qu'elle contient.</p>
 *
 * <p>Ce qui est décrit ici est <strong>ce qui existe</strong>, et la section des limites est
 * aussi importante que celle des fonctionnalités : un examinateur vérifie, et une promesse
 * invérifiable coûte plus qu'une fonctionnalité manquante.</p>
 */
function LolLandingPage() {
  const { t } = useTranslation("lol");
  const navigate = useLocalizedNavigate();
  const localize = useLocalizedPath();
  const { connected, canAny } = useAuthStore();
  const { riotLinked } = useProfileStore();

  useDocumentMeta({ title: t("meta.title"), description: t("meta.description") });

  const fonctionnalites = [
    { key: "roster", title: t("features.roster.title"), body: t("features.roster.body") },
    { key: "collect", title: t("features.collect.title"), body: t("features.collect.body") },
    { key: "playerStats", title: t("features.playerStats.title"), body: t("features.playerStats.body") },
    { key: "teamStats", title: t("features.teamStats.title"), body: t("features.teamStats.body") },
    { key: "pool", title: t("features.pool.title"), body: t("features.pool.body") },
    { key: "draft", title: t("features.draft.title"), body: t("features.draft.body") },
    { key: "reviews", title: t("features.reviews.title"), body: t("features.reviews.body") },
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
            t("limits.history"),
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
                <Button onClick={() => navigate("/lol/teams")}>{t("access.ctaTeams")}</Button>
              )}
              {/* Le compte Riot manquant renvoie au profil plutôt qu'à des statistiques vides :
                  c'est là que se joue la seule action utile à ce stade. */}
              {riotLinked ? (
                <Button variant="secondary" onClick={() => navigate("/lol/stats")}>
                  {t("access.ctaStats")}
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => navigate("/profile")}>
                  {t("access.ctaProfile")}
                </Button>
              )}
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Text>{t("access.signedOutBody")}</Text>
            <Stack direction="row">
              <Button onClick={() => navigate("/login")}>{t("access.ctaSignIn")}</Button>
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
