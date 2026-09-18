import { useEffect, useCallback } from "react";
import { Box, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ServersDashboard from "../components/AllServersComponent";
import { Button, LanguageSwitcher, PageBackdrop, ThemeModeToggle } from "../design-system";
import { useLocalizedNavigate } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";
import { useServersStore } from "../stores/serversStore";

const REFRESH_INTERVAL_MS = 30_000;

function LandingPage() {
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation("servers");
  const { connected } = useAuthStore();
  const { servers, isLoading, error, lastRefreshedAt, loadPublicServers } = useServersStore();

  const refresh = useCallback(() => {
    void loadPublicServers();
  }, [loadPublicServers]);

  useEffect(() => {
    void loadPublicServers();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadPublicServers, refresh]);

  return (
    <PageBackdrop centered>
      {/* Les deux bascules vivent ici en attendant l'en-tête applicatif, qui dépend de
          l'authentification (chantier A) et n'est donc pas encore dessiné. */}
      <Box sx={{ position: "absolute", top: 24, right: 24 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ThemeModeToggle />
          <LanguageSwitcher />
          {!connected && (
            <Button size="large" onClick={() => navigate("/login")}>
              {t("signIn", { ns: "auth" })}
            </Button>
          )}
        </Stack>
      </Box>

      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Typography variant="overline" color="primary" fontWeight={700}>
                {t("landing.eyebrow")}
              </Typography>
              <Typography variant="h3" fontWeight={800}>
                {t("landing.title")}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 700 }}>
                {t("landing.description")}
              </Typography>

              <ServersDashboard
                servers={servers}
                isLoading={isLoading}
                error={error}
                connected
                lastRefreshedAt={lastRefreshedAt}
                onRefresh={refresh}
              />
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </PageBackdrop>
  );
}

export default LandingPage;
