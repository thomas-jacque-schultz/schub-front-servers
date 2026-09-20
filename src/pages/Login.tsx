import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Card, DiscordIcon, Stack, Text, TextField } from "../design-system";
import { useLocalizedNavigate } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";

/**
 * L'écran de connexion — deux portes, et une seule qui compte.
 *
 * <p><strong>Discord est l'entrée principale</strong> (lot A.3). Le bouton fait une vraie
 * navigation vers `GET /auth/discord`, que le BFF résout en redirection vers l'écran
 * d'autorisation Discord ; tout le reste du flux se joue entre le navigateur, Discord et le BFF,
 * et se termine par un cookie `httpOnly` et un retour sur le site. Le front n'orchestre rien —
 * c'est exactement ce que le cookie permet.</p>
 *
 * <p><strong>Le formulaire mot de passe reste</strong>, en dessous et visuellement secondaire.
 * C'est la porte de service jusqu'au lot A.6, qui ne se lancera qu'après une connexion Discord
 * réussie en prod : on ne démonte pas la porte de service avant d'avoir vu la porte principale
 * s'ouvrir. Sa réponse pose le même cookie que le flux Discord, donc rien ici ne lit de jeton.</p>
 *
 * <p>Écrit avec les primitives du design system, et retiré à cette occasion du bloc « dette à
 * résorber » de `eslint.config.js`.</p>
 */
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
      // Le message est déjà porté par le store ; le relancer ici ne ferait que produire un
      // rejet non intercepté dans la console.
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
