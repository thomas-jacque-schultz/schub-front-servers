import { useTranslation } from "react-i18next";
import { BulletList, Card, Link, PageHeader, Stack, Text } from "../../design-system";
import { DraftNotice } from "./DraftNotice";
import { RiotDisclaimer } from "../../lol";
import { useLocalizedPath } from "../../i18n/navigation";
import { useDocumentMeta } from "../../seo/useDocumentMeta";

function TermsPage() {
  const { t } = useTranslation("legal");
  const localize = useLocalizedPath();

  useDocumentMeta({ title: t("terms.meta.title"), description: t("terms.meta.description") });

  return (
    <Stack spacing={4}>
      <PageHeader
        eyebrow={t("terms.hero.eyebrow")}
        title={t("terms.hero.title")}
        subtitle={t("terms.hero.subtitle")}
      />

      <DraftNotice />

      <Text variant="caption" tone="secondary">
        {t("updated")}
      </Text>

      <Card title={t("terms.purpose.title")}>
        <Stack spacing={2}>
          <Text>{t("terms.purpose.p1")}</Text>
          <Text>{t("terms.purpose.p2")}</Text>
        </Stack>
      </Card>

      <Card title={t("terms.publisher.title")}>
        <Stack spacing={2}>
          <Text>{t("terms.publisher.p1")}</Text>
          <Text>{t("terms.publisher.p2")}</Text>
        </Stack>
      </Card>

      <Card title={t("terms.account.title")}>
        <Stack spacing={2}>
          <Text>{t("terms.account.p1")}</Text>
          <Text>{t("terms.account.p2")}</Text>
          <Text>{t("terms.account.p3")}</Text>
        </Stack>
      </Card>

      <Card title={t("terms.riotAccount.title")}>
        <Stack spacing={2}>
          <Text>{t("terms.riotAccount.p1")}</Text>
          <Text>{t("terms.riotAccount.p2")}</Text>
          <Text>{t("terms.riotAccount.p3")}</Text>
        </Stack>
      </Card>

      <Card title={t("terms.content.title")}>
        <Stack spacing={2}>
          <Text>{t("terms.content.p1")}</Text>
          <Text>{t("terms.content.p2")}</Text>
          <BulletList
            items={[t("terms.content.i1"), t("terms.content.i2"), t("terms.content.i3")]}
          />
          <Text>{t("terms.content.p3")}</Text>
        </Stack>
      </Card>

      <Card title={t("terms.availability.title")}>
        <Stack spacing={2}>
          <Text>{t("terms.availability.p1")}</Text>
          <Text>{t("terms.availability.p2")}</Text>
          <Text>{t("terms.availability.p3")}</Text>
        </Stack>
      </Card>

      <Card title={t("terms.ip.title")}>
        <Stack spacing={2}>
          <Text>{t("terms.ip.p1")}</Text>
          <Text>{t("terms.ip.p2")}</Text>
        </Stack>
      </Card>

      <RiotDisclaimer />

      <Card title={t("terms.privacy.title")}>
        <Stack spacing={1.5}>
          <Text>{t("terms.privacy.p1")}</Text>
          <Link href={localize("/privacy")}>{t("terms.privacy.link")}</Link>
        </Stack>
      </Card>

      <Card title={t("terms.changes.title")}>
        <Text>{t("terms.changes.p1")}</Text>
      </Card>

      <Card title={t("terms.law.title")}>
        <Text>{t("terms.law.p1")}</Text>
      </Card>
    </Stack>
  );
}

export default TermsPage;
