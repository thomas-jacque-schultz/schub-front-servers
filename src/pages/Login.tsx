import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Card, DiscordIcon, Stack, Text, TextField } from "../design-system";
import { useLocalizedNavigate } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";

function LoginPage() {
  const { isSubmitting, error, login, loginWithDiscord, clearError } = useAuthStore();
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation("auth");

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [touched, setTouched] = useState<boolean>(false);

  const missingUsername = touched && username.trim() === "";
  const missingPassword = touched && password === "";

  const onLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (username.trim() === "" || password === "") {
      return;
    }

    clearError();
    try {
      await login(username, password);
      navigate("/config/servers", { replace: true });
    } catch {
      // Erreur déjà exposée par le store.
    }
  };

  return (
    <Stack spacing={3}>
      <Card title={t("login.discordTitle")} description={t("login.discordSubtitle")}>
        <Stack spacing={2} align="start">
          <Button size="large" startIcon={<DiscordIcon />} onClick={loginWithDiscord}>
            {t("login.discordSubmit")}
          </Button>
          <Text variant="caption" tone="secondary">
            {t("login.discordHint")}
          </Text>
        </Stack>
      </Card>

      <Card title={t("login.title")} description={t("login.subtitle")}>
        <Stack component="form" spacing={2} onSubmit={onLogin}>
          <TextField
            label={t("login.username")}
            name="username"
            value={username}
            onChange={setUsername}
            error={missingUsername}
            helperText={missingUsername ? t("validation.usernameRequired") : undefined}
          />

          <TextField
            label={t("login.password")}
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            error={missingPassword}
            helperText={missingPassword ? t("validation.passwordRequired") : undefined}
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={2}>
            <Button variant="ghost" onClick={() => navigate("/")}>
              {t("actions.back", { ns: "common" })}
            </Button>
            <Button type="submit" variant="secondary" loading={isSubmitting}>
              {t("login.submit")}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}

export default LoginPage;
