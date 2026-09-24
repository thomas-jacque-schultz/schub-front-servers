import { useTranslation } from "react-i18next";
import { Card, Link, Stack, Text } from "../../design-system";

const RIOT_POLICIES_URL = "https://developer.riotgames.com/policies/general";

// Texte imposé par Riot, reproduit tel quel et non traduit ; seul [Your product] est substitué.
export function RiotDisclaimer() {
  const { t } = useTranslation("legal");

  return (
    <Card title={t("riot.title")}>
      <Stack spacing={2}>
        <Text tone="secondary">{t("riot.intro")}</Text>
        <Text component="blockquote">{t("riot.text")}</Text>
        <Text variant="caption" tone="secondary">
          <Link href={RIOT_POLICIES_URL}>{t("riot.sourceLabel")}</Link>
        </Text>
      </Stack>
    </Card>
  );
}
