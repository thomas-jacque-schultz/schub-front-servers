import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ServersDashboard from "../components/AllServersComponent";
import { Card, PageHeader, Stack } from "../design-system";
import { useServersStore } from "../stores/serversStore";

const REFRESH_INTERVAL_MS = 30_000;

/**
 * L'accueil : l'état public des serveurs.
 *
 * <p>Elle n'habille plus rien elle-même — ni fond, ni bascule de thème, ni sélecteur de langue.
 * Tout cela appartient à la coquille depuis qu'elle existe. La page redevient ce qu'elle doit
 * être : un titre et une liste.</p>
 *
 * <p>Au chantier C, elle se déplacera sous `/servers` et la racine deviendra le portfolio. Rien
 * ici ne s'y oppose : la page ne sait pas à quelle adresse elle est servie.</p>
 */
function LandingPage() {
  const { t } = useTranslation("servers");
  const { servers, isLoading, error, lastRefreshedAt, loadPublicServers } = useServersStore();

  const refresh = useCallback(() => {
    void loadPublicServers();
  }, [loadPublicServers]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("landing.eyebrow")}
        title={t("landing.title")}
        subtitle={t("landing.description")}
      />

      <Card>
        <ServersDashboard
          servers={servers}
          isLoading={isLoading}
          error={error}
          connected
          lastRefreshedAt={lastRefreshedAt}
          onRefresh={refresh}
        />
      </Card>
    </Stack>
  );
}

export default LandingPage;
