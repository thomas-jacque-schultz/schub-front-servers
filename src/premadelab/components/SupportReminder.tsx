import { useTranslation } from "react-i18next";
import { Link, Stack, Text } from "../../common";
import { SUPPORT_URL } from "../shell";

/** Le rappel discret du bas de la fiche joueur et de Mes stats (Schub#115). */
export function SupportReminder() {
  const { t } = useTranslation("lol");
  return (
    <Stack direction="row" spacing={1} align="center" wrap>
      <Text variant="caption" tone="secondary">
        {t("support.reminder")}
      </Text>
      <Link href={SUPPORT_URL}>{t("support.reminderAction")}</Link>
    </Stack>
  );
}
