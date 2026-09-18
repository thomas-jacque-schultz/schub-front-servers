import { Alert, Box, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button, PageBackdrop } from "../design-system";
import { useLocalizedNavigate } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";

/**
 * Le schéma ne porte pas de message : chaque champ n'a qu'une règle, et son libellé est
 * traduit à l'affichage. Un message figé dans le schéma resterait dans la langue du premier
 * rendu, puisque le résolveur n'est pas reconstruit à chaque bascule.
 */
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const { isSubmitting, error, login, clearError } = useAuthStore();
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation("auth");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "",
    },
  });

  const onLogin = handleSubmit(async (values: LoginFormValues) => {
    clearError();
    await login(values.username, values.password);
    navigate("/dashboard", { replace: true });
  });

  return (
    <PageBackdrop centered>
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityIcon color="primary" />
                <Typography variant="h5" fontWeight={700}>
                  {t("login.title")}
                </Typography>
              </Stack>

              <Typography color="text.secondary">{t("login.subtitle")}</Typography>

              <Box component="form" onSubmit={onLogin}>
                <Stack spacing={2}>
                  <TextField
                    label={t("login.username")}
                    autoFocus
                    fullWidth
                    {...register("username")}
                    error={Boolean(errors.username)}
                    helperText={errors.username ? t("validation.usernameRequired") : undefined}
                  />

                  <TextField
                    label={t("login.password")}
                    type="password"
                    fullWidth
                    {...register("password")}
                    error={Boolean(errors.password)}
                    helperText={errors.password ? t("validation.passwordRequired") : undefined}
                  />

                  {error && <Alert severity="error">{error}</Alert>}

                  <Stack direction="row" spacing={2}>
                    <Button variant="secondary" onClick={() => navigate("/")}>
                      {t("actions.back", { ns: "common" })}
                    </Button>
                    <Button type="submit" size="large" loading={isSubmitting}>
                      {t("login.submit")}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </PageBackdrop>
  );
}

export default LoginPage;
