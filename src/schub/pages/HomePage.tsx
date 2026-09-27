import { useTranslation } from "react-i18next";
import {
  APP_URLS,
  Button,
  Card,
  PageHeader,
  Stack,
  Text,
  useAuthStore,
  useCurrentLanguage,
  useDocumentMeta,
  useLocalizedNavigate,
} from "../../common";

// L'accueil de Schub renvoie vers ses outils : les serveurs, et PremadeLab sur son propre domaine.
function HomePage() {
  const { t } = useTranslation("home");
  const navigate = useLocalizedNavigate();
  const language = useCurrentLanguage();
  const { connected } = useAuthStore();

  useDocumentMeta({
    title: t("meta.title"),
    description: t("meta.description"),
  });

  const premadelab =
    language === "en" ? `${APP_URLS.premadelab}/en` : APP_URLS.premadelab;

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
            <Button
              variant="secondary"
              onClick={() => window.location.assign(premadelab)}
            >
              {t("about.ctaLol")}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {!connected && (
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
