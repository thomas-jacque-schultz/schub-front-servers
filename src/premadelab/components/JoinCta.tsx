import { useTranslation } from "react-i18next";
import { Button, Card, Stack, Text, useAuthStore } from "../../common";
import { retenirApresConnexion } from "../afterLogin";

/** L'appel à se connecter de la vitrine : la connexion Discord, puis la création d'équipe. */
export function JoinCta() {
  const { t } = useTranslation("lol");
  const { connected, loginWithDiscord } = useAuthStore();

  if (connected) {
    return null;
  }

  const rejoindre = () => {
    retenirApresConnexion("/teams");
    loginWithDiscord();
  };

  return (
    <Card>
      <Stack
        direction="responsive"
        spacing={2}
        align="center"
        justify="between"
      >
        <Stack spacing={0.5}>
          <Text variant="section">{t("cta.title")}</Text>
          <Text tone="secondary">{t("cta.body")}</Text>
        </Stack>
        <Button size="large" onClick={rejoindre}>
          {t("cta.button")}
        </Button>
      </Stack>
    </Card>
  );
}
