import { useTranslation } from "react-i18next";
import { Alert, Stack, Text } from "../../design-system";

/**
 * L'avertissement de tête des deux pages de texte.
 *
 * <p>Ces documents engagent l'éditeur du site et n'ont pas été relus par un juriste. Le dire en
 * tête, et non en note de bas de page, est la seule façon de ne pas laisser croire le contraire à
 * quelqu'un qui les lirait de bonne foi — un examinateur du portail développeur de Riot compris.
 * L'avertissement disparaît quand la relecture a eu lieu, pas avant.</p>
 */
export function DraftNotice() {
  const { t } = useTranslation("legal");

  return (
    <Alert severity="warning" title={t("draft.title")}>
      <Stack spacing={1}>
        <Text variant="caption">{t("draft.body")}</Text>
        <Text variant="caption">{t("draft.marker")}</Text>
      </Stack>
    </Alert>
  );
}
