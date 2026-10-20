import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Stack,
  Text,
  useAuthStore,
  useLocalizedNavigate,
} from "../../common";
import { retenirApresConnexion } from "../afterLogin";

/** L'appel à se connecter de la vitrine : la page de connexion (qui explique les droits demandés), puis la création d'équipe. */
export function JoinCta() {
  const { t } = useTranslation("lol");
  const { connected } = useAuthStore();
  const navigate = useLocalizedNavigate();

  if (connected) {
    return null;
  }

  const rejoindre = () => {
    retenirApresConnexion("/teams");
    navigate("/login");
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
