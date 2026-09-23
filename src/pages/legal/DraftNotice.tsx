import { useTranslation } from "react-i18next";
import { Alert, Stack, Text } from "../../design-system";

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
