import { useTranslation } from "react-i18next";
import { Card, Link, Stack, Text } from "../design-system";
import { useProductName } from "../product";

const RIOT_POLICIES_URL = "https://developer.riotgames.com/policies/general";

// Texte imposé par Riot, reproduit tel quel et non traduit ; seul [Your product] est substitué.
export function RiotDisclaimer() {
  const { t } = useTranslation("legal");
  const product = useProductName();

  return (
    <Card title={t("riot.title")}>
      <Stack spacing={2}>
        <Text tone="secondary">{t("riot.intro", { product })}</Text>
        <Text component="blockquote">{t("riot.text", { product })}</Text>
        <Text variant="caption" tone="secondary">
          <Link href={RIOT_POLICIES_URL}>{t("riot.sourceLabel")}</Link>
        </Text>
      </Stack>
    </Card>
  );
}
