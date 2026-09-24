import { useTranslation } from "react-i18next";
import { Alert, Button, Card, DiscordIcon, Stack, Text } from "../design-system";
import { useLocalizedNavigate } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";

/** La seule entrée : il n'existe plus de compte local ni de mot de passe. */
function LoginPage() {
  const { error, loginWithDiscord } = useAuthStore();
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation("auth");

  return (
    <Card title={t("login.discordTitle")} description={t("login.discordSubtitle")}>
      <Stack spacing={2} align="start">
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction="row" spacing={2}>
          <Button variant="ghost" onClick={() => navigate("/")}>
            {t("actions.back", { ns: "common" })}
          </Button>
          <Button size="large" startIcon={<DiscordIcon />} onClick={loginWithDiscord}>
            {t("login.discordSubmit")}
          </Button>
        </Stack>
        <Text variant="caption" tone="secondary">
          {t("login.discordHint")}
        </Text>
      </Stack>
    </Card>
  );
}

export default LoginPage;
