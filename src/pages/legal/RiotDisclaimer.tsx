import { useTranslation } from "react-i18next";
import { Card, Link, Stack, Text } from "../../design-system";

/** La page d'où vient la formulation, citée pour qu'on puisse la revérifier sans la chercher. */
const RIOT_POLICIES_URL = "https://developer.riotgames.com/policies/general";

/**
 * La mention légale que Riot Games impose à tout produit tiers.
 *
 * <p>Le texte anglais est <strong>reproduit tel quel</strong> et n'est pas traduit : c'est une
 * formulation imposée, pas une phrase du site. Le seul ajustement autorisé est la substitution du
 * nom du produit à <em>[Your product]</em>. Ce qui est traduit, c'est ce qui l'entoure — ce
 * qu'elle est, qui l'exige, et où la vérifier.</p>
 *
 * <p>Elle vit dans un composant partagé parce qu'elle doit apparaître « à un endroit visible des
 * joueurs » : la recopier sur chaque page la ferait diverger à la première retouche.</p>
 */
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
