import { useTranslation } from "react-i18next";
import {
  BulletList,
  Card,
  Link,
  PageHeader,
  RiotDisclaimer,
  Stack,
  Text,
  useDocumentMeta,
  useHistoryWindow,
  useLocalizedPath,
} from "../../common";
import { HomeTiles } from "../components/HomeTiles";

const QUESTIONS = ["duo", "premade", "games", "free"] as const;

/** Hors du bandeau (#72) : lue par les robots et par l'examinateur de Riot, sans compte. */
function LolLandingPage() {
  const { t } = useTranslation("lol");
  const localize = useLocalizedPath();
  const historyWindow = useHistoryWindow();

  useDocumentMeta({
    title: t("meta.title"),
    description: t("meta.description"),
  });

  return (
    <Stack spacing={4}>
      <PageHeader
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
      />

      <HomeTiles />

      <Card title={t("home.faq.title")}>
        <Stack spacing={2}>
          {QUESTIONS.map((question) => (
            <Stack key={question} spacing={0.5}>
              <Text variant="subtitle">
                {t(`home.faq.${question}.question`)}
              </Text>
              <Text>{t(`home.faq.${question}.answer`)}</Text>
            </Stack>
          ))}
        </Stack>
      </Card>

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
