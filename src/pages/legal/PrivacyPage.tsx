import { useTranslation } from "react-i18next";
import { BulletList, Card, Link, PageHeader, Stack, Text } from "../../design-system";
import { DraftNotice } from "./DraftNotice";
import { RiotDisclaimer } from "./RiotDisclaimer";
import { useLocalizedPath } from "../../i18n/navigation";
import { useDocumentMeta } from "../../seo/useDocumentMeta";

function PrivacyPage() {
  const { t } = useTranslation("legal");
  const localize = useLocalizedPath();

  useDocumentMeta({ title: t("privacy.meta.title"), description: t("privacy.meta.description") });

  const collecte = [
    { key: "discord", title: t("privacy.collected.discordTitle"), body: t("privacy.collected.discord") },
    { key: "account", title: t("privacy.collected.accountTitle"), body: t("privacy.collected.account") },
    { key: "riot", title: t("privacy.collected.riotTitle"), body: t("privacy.collected.riot") },
    { key: "matches", title: t("privacy.collected.matchesTitle"), body: t("privacy.collected.matches") },
    { key: "others", title: t("privacy.collected.othersTitle"), body: t("privacy.collected.others") },
    { key: "teams", title: t("privacy.collected.teamsTitle"), body: t("privacy.collected.teams") },
    { key: "reviews", title: t("privacy.collected.reviewsTitle"), body: t("privacy.collected.reviews") },
    { key: "contact", title: t("privacy.collected.contactTitle"), body: t("privacy.collected.contact") },
  ];

  return (
    <Stack spacing={4}>
      <PageHeader
        eyebrow={t("privacy.hero.eyebrow")}
        title={t("privacy.hero.title")}
        subtitle={t("privacy.hero.subtitle")}
      />

      <DraftNotice />

      <Text variant="caption" tone="secondary">
        {t("updated")}
      </Text>

      <Card title={t("privacy.controller.title")}>
        <Stack spacing={2}>
          <Text>{t("privacy.controller.p1")}</Text>
          <Text>{t("privacy.controller.p2")}</Text>
        </Stack>
      </Card>

      <Card title={t("privacy.collected.title")}>
        <Stack spacing={3}>
          {collecte.map((poste) => (
            <Stack key={poste.key} spacing={0.5}>
              <Text variant="section">{poste.title}</Text>
              <Text>{poste.body}</Text>
            </Stack>
          ))}
        </Stack>
      </Card>

      <Card title={t("privacy.notCollected.title")}>
        <BulletList
          items={[
            t("privacy.notCollected.i1"),
            t("privacy.notCollected.i2"),
            t("privacy.notCollected.i3"),
            t("privacy.notCollected.i4"),
          ]}
        />
      </Card>

      <Card title={t("privacy.cookies.title")}>
        <Stack spacing={2}>
          <Text>{t("privacy.cookies.session")}</Text>
          <Text>{t("privacy.cookies.local")}</Text>
          <Text>{t("privacy.cookies.turnstile")}</Text>
        </Stack>
      </Card>

      <Card title={t("privacy.purposes.title")}>
        <Stack spacing={2}>
          <BulletList
            items={[
              t("privacy.purposes.i1"),
              t("privacy.purposes.i2"),
              t("privacy.purposes.i3"),
              t("privacy.purposes.i4"),
              t("privacy.purposes.i5"),
            ]}
          />
          <Text tone="secondary">{t("privacy.purposes.basis")}</Text>
        </Stack>
      </Card>

      <Card title={t("privacy.storage.title")}>
        <Stack spacing={2}>
          <Text>{t("privacy.storage.p1")}</Text>
          <Text>{t("privacy.storage.p2")}</Text>
        </Stack>
      </Card>

      <Card title={t("privacy.retention.title")}>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Text variant="section">{t("privacy.retention.cachesTitle")}</Text>
            <Text>{t("privacy.retention.caches")}</Text>
          </Stack>
          <Stack spacing={0.5}>
            <Text variant="section">{t("privacy.retention.permanentTitle")}</Text>
            <Text>{t("privacy.retention.permanent")}</Text>
            <Text>{t("privacy.retention.riotPurge")}</Text>
          </Stack>
          <Stack spacing={0.5}>
            <Text variant="section">{t("privacy.retention.accountTitle")}</Text>
            <Text>{t("privacy.retention.account")}</Text>
          </Stack>
        </Stack>
      </Card>

      <Card title={t("privacy.sharing.title")}>
        <Stack spacing={2}>
          <Text>{t("privacy.sharing.p1")}</Text>
          <Text>{t("privacy.sharing.p2")}</Text>
          <BulletList
            items={[t("privacy.sharing.i1"), t("privacy.sharing.i2"), t("privacy.sharing.i3")]}
          />
          <Text>{t("privacy.sharing.p3")}</Text>
        </Stack>
      </Card>

      <Card title={t("privacy.rights.title")}>
        <Stack spacing={3}>
          <Text>{t("privacy.rights.p1")}</Text>
          <Stack spacing={1}>
            <Text variant="section">{t("privacy.rights.selfTitle")}</Text>
            <BulletList
              items={[
                t("privacy.rights.self1"),
                t("privacy.rights.self2"),
                t("privacy.rights.self3"),
                t("privacy.rights.self4"),
              ]}
            />
          </Stack>
          <Stack spacing={0.5}>
            <Text variant="section">{t("privacy.rights.gapTitle")}</Text>
            <Text>{t("privacy.rights.gap")}</Text>
          </Stack>
          <Stack spacing={1}>
            <Text variant="section">{t("privacy.rights.howTitle")}</Text>
            <Text>{t("privacy.rights.how")}</Text>
            <Text>{t("privacy.rights.thirdParty")}</Text>
            <Link href={localize("/contact")}>{t("shell.contact", { ns: "common" })}</Link>
          </Stack>
        </Stack>
      </Card>

      <Card title={t("privacy.minors.title")}>
        <Text>{t("privacy.minors.p1")}</Text>
      </Card>

      <RiotDisclaimer />

      <Card title={t("privacy.changes.title")}>
        <Stack spacing={1.5}>
          <Text>{t("privacy.changes.p1")}</Text>
          <Link href={localize("/terms")}>{t("terms.hero.title")}</Link>
        </Stack>
      </Card>
    </Stack>
  );
}

export default PrivacyPage;
